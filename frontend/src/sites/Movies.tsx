import '../styles/Movies.css';
import Modal from 'react-modal';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import useState from 'react-usestateref';
import { modalStyles } from '../styles/ModalStyles';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { GET_USER_DATA_QUERY} from './Signup';

export default function Movies() {
  const RETRIEVE_CURRENT_ACCOUNT_DATA_QUERY = gql`
    query RetrieveCurrentAccountDataQuery {
        me {
          id
          email
          name
        }
    }
    `
    ;
  const UPDATE_USER_MUTATION = gql`
    mutation updateUser($email: String, $name: String) {
      updateUser(email: $email, name: $name) {
        id
      }
    }
    `
    ;
  const UPDATE_USER_PASSWORD_MUTATION = gql`
    mutation updateUserPassword($password: String!) {
      updateUserPassword(password: $password) {
        id
      }
    }
    `
    ;
  const RETRIEVE_ALL_MOVIES_QUERY = gql`
    query RetrieveAllMovies {
      getAllMovies {
        id
        title
        description
        releaseYear
        directors
        topCast
        countries
        trailerEmbedUrl
      }
    }
    `;
  const DELETE_USER_MUTATION = gql`
    mutation DeleteUser {
      deleteUser {
        id
      }
    }
    `;
  const FIND_MOVIES_QUERY = gql`
    query FindMovies($searchString: String) {
      findMovies(searchString: $searchString) {
        id
        title
        description
        releaseYear
        directors
        topCast
        countries
        trailerEmbedUrl
      }
    }
    `;
  const [moviesImages, setMoviesImages] = useState(null);
  const [areSubmittedDetailsSame, setAreSubmittedDetailsSame, areSubmittedDetailsSameRef] = useState(false);
  const formikReference = useRef(null);
  const [mutateUpdateUser] = useMutation(UPDATE_USER_MUTATION, {
    refetchQueries: [{query: RETRIEVE_CURRENT_ACCOUNT_DATA_QUERY}, {query: GET_USER_DATA_QUERY}] // updates the client's cache with fresh data
  });
  const [mutateUpdateUserPassword] = useMutation(UPDATE_USER_PASSWORD_MUTATION);
  const {data} = useQuery(RETRIEVE_CURRENT_ACCOUNT_DATA_QUERY);
  const {data: allUsersData} = useQuery(GET_USER_DATA_QUERY);
  const {data: allMovies} = useQuery(RETRIEVE_ALL_MOVIES_QUERY);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [movieModalOpen,setMovieModalOpen] = useState(false);
  const [mutateDeleteUser] = useMutation(DELETE_USER_MUTATION);
  const [key, setKey] = useState(null);
  const [findMoviesQueryFunction] = useLazyQuery(FIND_MOVIES_QUERY);
  const [foundMoviesData, setFoundMoviesData] = useState(null);
  const [searchPhrase, setSearchPhrase] = useState(null);
  const [foundMoviesImages, setFoundMoviesImages] = useState(null);
  const [allMoviesTreshold, setAllMoviesTreshold] = useState(17);
  const [showAllMoviesLoadMoreButton, setShowAllMoviesLoadMoreButton] = useState(false);
  const [foundMoviesTreshold, setFoundMoviesTreshold] = useState(17);
  const [showFoundMoviesLoadMoreButton, setShowFoundMoviesLoadMoreButton] = useState(false);
  useEffect(() => {
    async function downloadMoviesImages() {
      try {
        const moviesImagesResponse = await fetch('http://localhost:4001/downloadMoviesImages', {
          method: 'POST'
        });
        const moviesImagesResponseData = await moviesImagesResponse.json();
        setMoviesImages(moviesImagesResponseData);
      }
      catch(e) {
        console.log('Error downloading movies images');
      }
    }
    downloadMoviesImages();
  },[]);
  useEffect(() => {
    if(allMovies?.getAllMovies && allMoviesTreshold < allMovies?.getAllMovies?.length - 1) {
      setShowAllMoviesLoadMoreButton(true);
    }
    if(foundMoviesData && foundMoviesTreshold < foundMoviesData?.length - 1) {
      setShowFoundMoviesLoadMoreButton(true);
    }
  });
  let accountFormInitialValues = {
    email: '',
    name: ''
  };
  if(data && data.me) {
    accountFormInitialValues = {
      email: data.me.email,
      name: data.me.name
    };
  }
  const newPasswordFormInitialValues = {
    password: '',
    confirmPassword: ''
  };
  const accountFormValidationSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email required") // defines a string schema
            .test('check-if-email-already-exists', 'Email already exists',
              function(value) {
                let emailAlreadyExists = false;
                if(allUsersData && allUsersData.users && data && data.me) {
                  allUsersData.users.forEach(function(user: any) {
                      if(user.email === value && data.me.email !== value) {
                          emailAlreadyExists = true;
                      }
                  });
                }
                if(emailAlreadyExists) {
                  return false; // returns a message "Email already exists"
                }
                return true;
              }),
    name: yup.string().max(15,"15 characters or less").required("Name required")
  });
  const newPasswordFormValidationSchema = yup.object({
    password: yup.string().max(20, '20 characters or less').required("Password required"),
    confirmPassword: yup.string().oneOf([yup.ref("password")],"Passwords must match").required("Confirm password") // if password field has null value
  });
  const openModal = () => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    removeSubmittedDetailsAreTheSameErrorMessage();
    document.body.style.overflow = 'auto';
    setIsOpen(false);
  };
  const openMovieModal = () => {
    setMovieModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeMovieModal = () => {
    document.body.style.overflow = 'auto';
    setMovieModalOpen(false);
  };
  const deleteAccount = async () => {
    if(window.confirm('Your account and data will be deleted. Continue?')) {
      await mutateDeleteUser();
      localStorage.removeItem("Movie App Authentication Token");
      window.location.reload();
    }
  };
  function logOut() {
    localStorage.removeItem("Movie App Authentication Token");
    window.location.reload();
  }
  function checkIfSubmittedDetailsAreSame() {
    if(data && data.me && formikReference.current.values && formikReference.current.values.email && formikReference.current.values.name) {
      if(data.me.email === formikReference.current.values.email && data.me.name === formikReference.current.values.name) {
        setAreSubmittedDetailsSame(true);
      }
    }
  }
  function removeSubmittedDetailsAreTheSameErrorMessage() {
    setAreSubmittedDetailsSame(false);
  }
  const findMoviesAcceptableKeys = [
    'A','B','C','D','E','F','G','H','I','J','K',
    'L','M','N','O','P','Q','R','S','T','U','V',
    'W','X','Y','Z','a','b','c','d','e','f','g',
    'h','i','j','k','l','m','n','o','p','q','r',
    's','t','u','v','w','x','y','z','0','1','2',
    '3','4','5','6','7','8','9',':',';',',','.',
    '?','!','/',' ','Enter','Backspace'];
  async function findMovies(e: any) {
    if(e.target.value.length === 0) {
      setFoundMoviesData(null);
      setSearchPhrase(null);
    }
    const searchPhraseCharacters: any[] = e.target.value.split('').map((value: any) => { 
      if(findMoviesAcceptableKeys.includes(value)) {
        return true;
      }
      return false;
    });
    const allSearchPhraseCharactersAcceptable: boolean = searchPhraseCharacters.every((elem) => {
      if(elem) {
        return true;
      }
      return false;
    });
    if(findMoviesAcceptableKeys.includes(e.key) && allSearchPhraseCharactersAcceptable && e.target.value.length > 0) {
      try {
        const foundMovies = await findMoviesQueryFunction({variables: {searchString: e.target.value}});
        setFoundMoviesData(foundMovies.data.findMovies);
        setSearchPhrase(e.target.value);
        const foundMoviesImages: any[] = [];
        moviesImages.map((moviesImage: any) => {
            foundMovies.data.findMovies.map((movie: any) => {
            if(movie.id === moviesImage[2]) {
              foundMoviesImages.push(moviesImage);
            }
          });
        });
        setFoundMoviesImages(foundMoviesImages);
      }
      catch(e) {
        console.log('Error finding movies');
      }
    }
  }
  function findMoviesSubmit(e: any) {
    e.preventDefault(); // prevent the submit event which means that a page will not reload
  }
  function showGoToTopOfPageButton() {
    const goToTopOfPageButton = document.getElementById("movies-go-to-top-of-page-button");
    const distanceFromTopOfPage = 500; // in pixels
    if(document.body.scrollTop > distanceFromTopOfPage || document.documentElement.scrollTop > distanceFromTopOfPage) {
      goToTopOfPageButton.style.display = "block";
    }
    else {
      goToTopOfPageButton.style.display = "none";
    }
  }
  window.onscroll = function() {
    showGoToTopOfPageButton();
  };
  function goToTopOfPage() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  function allMoviesLoadMore() {
    const step = 18;
    setAllMoviesTreshold(allMoviesTreshold + step);
    if(allMoviesTreshold + step >= allMovies?.getAllMovies?.length - 1) {
      setShowAllMoviesLoadMoreButton(false);
    }
  }
  function foundMoviesLoadMore() {
    const step = 18;
    setFoundMoviesTreshold(foundMoviesTreshold + step);
    if(foundMoviesTreshold + step >= foundMoviesData?.length - 1) {
      setShowFoundMoviesLoadMoreButton(false);
    }
  }
  return (
    <div className="movies-container">
      <div className="movies-navbar">
        <span className="movies-logo">
          <a href='/movies' className="movies-a">
            <i id="movies-logo-icon" className="fa-solid fa-film" aria-hidden="true"></i>
          </a>
        </span>
        <span className="movies-search-field">
          <form className='movies-form-search' onSubmit={findMoviesSubmit} >
            <input className='movies-input-search' type="text" onKeyUp={findMovies} placeholder="Search..."></input>
          </form>
        </span>
        <span className="movies-user-icon">
          <i id="movies-user-icon-i" className="fa-solid fa-circle-user" aria-hidden="true">
            <div className='movies-user-icon-dropdown-content'>
              <div className='movies-user-icon-dropdown-content-item' onClick={openModal}>Account</div>
              <Modal closeTimeoutMS={60} isOpen={modalIsOpen} onRequestClose={closeModal} style={modalStyles} ariaHideApp={false}>
                <h1 className='movies-account-modal-h1'>Account</h1>
                <Formik initialValues={accountFormInitialValues} validationSchema={accountFormValidationSchema} innerRef={formikReference} onSubmit={async (values,{setSubmitting}) => {
                    setSubmitting(true);
                    checkIfSubmittedDetailsAreSame();
                    if(!areSubmittedDetailsSameRef.current) {
                      await mutateUpdateUser({variables: values});
                      closeModal();
                    }
                    setSubmitting(false);
                }}>
                  <Form className='movies-form-account'>
                    <Field name='email' className='movies-input-account' type="text" onKeyDown={removeSubmittedDetailsAreTheSameErrorMessage}></Field>
                    <ErrorMessage name='email' className='movies-input-account-error-message' component={'div'} />
                    <Field name='name' className='movies-input-account' type="text" onKeyDown={removeSubmittedDetailsAreTheSameErrorMessage}></Field>
                    <ErrorMessage name='name' className='movies-input-account-error-message' component={'div'} />
                    {areSubmittedDetailsSame ? (
                      <div className='movies-input-account-error-message'>Submitted details are the same as current details</div>
                    ) : null}
                    <button type="submit" className='movies-button-account'>Update</button>
                  </Form>
                </Formik>
                <br />
                <Formik initialValues={newPasswordFormInitialValues} validationSchema={newPasswordFormValidationSchema} onSubmit={async (values,{setSubmitting}) => {
                    setSubmitting(true);
                    await mutateUpdateUserPassword({variables: values});
                    closeModal();
                    setSubmitting(false);
                }}>
                  <Form className='movies-form-account'>
                    <Field name='password' className='movies-input-account' type="password" placeholder='New password'></Field>
                    <ErrorMessage name='password' className='movies-input-account-error-message' component={'div'} />
                    <Field name='confirmPassword' className='movies-input-account' type="password" placeholder='Confirm password'></Field>
                    <ErrorMessage name='confirmPassword' className='movies-input-account-error-message' component={'div'} />
                    <button type="submit" className='movies-button-account'>Update password</button>
                  </Form>
                </Formik>
                <button type='button' className='movies-account-delete-button' onClick={deleteAccount}>Delete account</button>
              </Modal>
              <div className='movies-user-icon-dropdown-content-item' onClick={logOut}>Log out</div>
            </div>
          </i>
        </span>
      </div>
      <button id='movies-go-to-top-of-page-button' onClick={goToTopOfPage}>
        <i id='movies-go-to-top-of-page-button-i' className="fa-solid fa-arrow-up"></i> Go to top
      </button>
      {
        foundMoviesData ? (
          <>
            <h1 className='movies-movies-list-h1'>Results For "{searchPhrase}"</h1>
            <div className='movies-movies-list'>
              {
                foundMoviesData?.filter((movie: any, index: any) => {
                  return index <= foundMoviesTreshold;
                })?.map((movie: any, index: any) => (
                  <div className='movies-movies-list-item' key={index} onClick={ function() {
                    setKey(index);
                    openMovieModal();
                  }}>
                    <img className='movies-movies-list-item-img' src={foundMoviesImages?.filter((movie: any, index: any) => { return index <= foundMoviesTreshold;})?.[index][1]}></img>
                    <br />
                    <b>Title:</b> {movie.title}
                    <br />
                    <b>Year:</b> {movie.releaseYear}
                    <br />
                    <b>Director(s):</b> {movie.directors.map((director:any,index:any) => (
                      <span className='movies-movies-list-item-span' key={index}><br />{director + ' '}</span>
                    ))}
                  </div>
                ))
              }
              <Modal closeTimeoutMS={60} isOpen={movieModalOpen} onRequestClose={closeMovieModal} style={modalStyles} ariaHideApp={false}>
                <div className='movies-movies-list-item-modal-image'>
                  <img className='movies-movies-list-item-modal-image-img' src={foundMoviesImages?.filter((movie: any, index: any) => { return index <= foundMoviesTreshold;})?.[key]?.[1]}></img>
                </div>
                <div className='movies-movies-list-item-modal-title'><b>Title:</b> {foundMoviesData?.filter((movie: any, index: any) => { return index <= foundMoviesTreshold;})?.[key]?.title}</div>
                <b>Year:</b> {foundMoviesData[key]?.releaseYear}
                <br />
                <b>Director(s):</b> {foundMoviesData?.filter((movie: any, index: any) => { return index <= foundMoviesTreshold;})?.[key]?.directors?.map((director:any,index:any) => (
                  <span className='movies-movies-list-item-modal-span' key={index}><br />{director + ' '}</span>
                ))}
                <br />
                <b>Top Cast:</b> {foundMoviesData?.filter((movie: any, index: any) => { return index <= foundMoviesTreshold;})?.[key]?.topCast?.map((castMember:any,index:any) => (
                  <span className='movies-movies-list-item-modal-span' key={index}><br />{castMember + ' '}</span>
                ))}
                <br />
                <b>Country(ies):</b> {foundMoviesData?.filter((movie: any, index: any) => { return index <= foundMoviesTreshold;})?.[key]?.countries?.map((country:any,index:any) => (
                  <span className='movies-movies-list-item-modal-span' key={index}><br />{country + ' '}</span>
                ))}
                <br />
                <b>Description:</b>
                <br />
                {foundMoviesData?.filter((movie: any, index: any) => { return index <= foundMoviesTreshold;})?.[key]?.description}
                <div className='movies-movies-list-item-modal-trailer'>
                  <h1 className='movies-movies-list-item-modal-trailer-h1'>Trailer</h1>
                  <iframe
                    className='movies-movies-list-item-modal-trailer-iframe'
                    src={foundMoviesData?.filter((movie: any, index: any) => { return index <= foundMoviesTreshold;})?.[key]?.trailerEmbedUrl}
                    width="450"
                    height="337"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen">
                  </iframe>
                </div>
              </Modal>
              {
                showFoundMoviesLoadMoreButton ? (
                  <div id='movies-load-more-button' className='movies-load-more-button' onClick={foundMoviesLoadMore}>
                    <button id='movies-load-more-button-button'>
                      <i id='movies-load-more-button-button-i' className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                ) : null
              }
            </div>
          </>
        ) : (
          <>
            <h1 className='movies-movies-list-h1'>All Movies</h1>
            <div className='movies-movies-list'>
              {
                allMovies && allMovies.getAllMovies && moviesImages ? (
                  allMovies.getAllMovies?.filter((movie: any, index: any) => {
                      return index <= allMoviesTreshold;
                    })?.map((movie: any, index: any) => (
                      <div id='movies-movies-list-item' className='movies-movies-list-item' key={index} onClick={ function() {
                        setKey(index);
                        openMovieModal();
                      }}>
                        <img className='movies-movies-list-item-img' src={moviesImages?.filter((movie: any, index: any) => { return index <= allMoviesTreshold;})?.[index]?.[1]}></img>
                        <br />
                        <b>Title:</b> {movie.title}
                        <br />
                        <b>Year:</b> {movie.releaseYear}
                        <br />
                        <b>Director(s):</b> {movie.directors.map((director:any,index:any) => (
                          <span className='movies-movies-list-item-span' key={index}><br />{director + ' '}</span>
                        ))}
                      </div>
                    ))
                ) : null
              }
              <Modal closeTimeoutMS={60} isOpen={movieModalOpen} onRequestClose={closeMovieModal} style={modalStyles} ariaHideApp={false}>
                {
                  allMovies && allMovies.getAllMovies ? (
                    <>
                      <div className='movies-movies-list-item-modal-image'>
                        <img className='movies-movies-list-item-modal-image-img' src={moviesImages?.filter((movie: any, index: any) => {return index <= allMoviesTreshold;})?.[key]?.[1]}></img>
                      </div>
                      <div className='movies-movies-list-item-modal-title'><b>Title:</b> {allMovies.getAllMovies?.filter((movie: any, index: any) => {return index <= allMoviesTreshold;})?.[key]?.title}</div>
                      <b>Year:</b> {allMovies.getAllMovies?.filter((movie: any, index: any) => {return index <= allMoviesTreshold;})?.[key]?.releaseYear}
                      <br />
                      <b>Director(s):</b> {allMovies.getAllMovies?.filter((movie: any, index: any) => {return index <= allMoviesTreshold;})?.[key]?.directors?.map((director:any,index:any) => (
                        <span className='movies-movies-list-item-modal-span' key={index}><br />{director + ' '}</span>
                      ))}
                      <br />
                      <b>Top Cast:</b> {allMovies.getAllMovies?.filter((movie: any, index: any) => {return index <= allMoviesTreshold;})?.[key]?.topCast?.map((castMember:any,index:any) => (
                        <span className='movies-movies-list-item-modal-span' key={index}><br />{castMember + ' '}</span>
                      ))}
                      <br />
                      <b>Country(ies):</b> {allMovies.getAllMovies?.filter((movie: any, index: any) => {return index <= allMoviesTreshold;})?.[key]?.countries?.map((country:any,index:any) => (
                        <span className='movies-movies-list-item-modal-span' key={index}><br />{country + ' '}</span>
                      ))}
                      <br />
                      <b>Description:</b>
                      <br />
                      {allMovies.getAllMovies?.filter((movie: any, index: any) => {return index <= allMoviesTreshold;})?.[key]?.description}
                      <div className='movies-movies-list-item-modal-trailer'>
                        <h1 className='movies-movies-list-item-modal-trailer-h1'>Trailer</h1>
                        <iframe
                          className='movies-movies-list-item-modal-trailer-iframe'
                          src={allMovies.getAllMovies?.filter((movie: any, index: any) => {return index <= allMoviesTreshold;})?.[key]?.trailerEmbedUrl}
                          width="450"
                          height="337"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen">
                        </iframe>
                      </div>
                    </>
                  ) : null
                }
              </Modal>
              {
                showAllMoviesLoadMoreButton ? (
                  <div id='movies-load-more-button' className='movies-load-more-button' onClick={allMoviesLoadMore}>
                    <button id='movies-load-more-button-button'>
                      <i id='movies-load-more-button-button-i' className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                ) : null
              }
            </div>
          </>
        )
      }
    </div>
  )
}