import { gql, useMutation, useQuery } from '@apollo/client';
import { ErrorMessage, Field, Form, Formik } from 'formik'; 
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginSignup.css';
import { useRef, useState } from 'react';

const SIGNUP_MUTATION = gql`
mutation signup($name: String, $email: String!, $password: String!){
    signup(name: $name, email: $email, password: $password){
        token
    }
}
`;

export const GET_USER_DATA_QUERY = gql`
query {
    users {
        email
    }
}
`
;

interface SignupValues {
    email: string,
    password: string,
    confirmPassword: string,
    name: string
}

function Signup(){
    const navigate = useNavigate();
    const [emailAlreadyExistsError, setEmailAlreadyExistsError] = useState(false);
    const [mutateSignup] = useMutation(SIGNUP_MUTATION); // returns a tuple consisting of a mutate function that you can call at any time to execute the mutation and an object with fields that represent the current status of the mutation's execution (data, loading, etc.)
    const initialValues: SignupValues = {
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    }
    const validationSchema = yup.object({
        email: yup.string().email("Invalid email address").required("Email required"), // defines a string schema
        password: yup.string().max(20, '20 characters or less').required("Password required"),
        confirmPassword: yup.string().oneOf([yup.ref("password")],"Passwords must match").required("Confirm password"), // if password field has null value
        name: yup.string().max(15,"15 characters or less").required("Name required")
    })
    const formikReference = useRef(null);
    const {data} = useQuery(GET_USER_DATA_QUERY);
    function checkIfEmailExists() {
        setEmailAlreadyExistsError(false);
        if(data.users && formikReference.current.values.email) {
            data.users.forEach(function(user: any) {
                if(user.email === formikReference.current.values.email) {
                    setEmailAlreadyExistsError(true);
                }
            });
        }
    }
    function removeEmailAlreadyExistsErrorMessage() {
        setEmailAlreadyExistsError(false);
    }
    return(
        <div className='loginsignup-container'>
            <i id='loginsignup-logo' className='fa-solid fa-film' aria-hidden="true"></i>
            <h3 className='loginsignup-h3'>Sign up</h3>
            <Formik
                innerRef={formikReference}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values,{setSubmitting}) => {
                    setSubmitting(true);
                    checkIfEmailExists();
                    const response = await mutateSignup({ variables: values});
                    localStorage.setItem("Movie App Authentication Token", response.data.signup.token);
                    setSubmitting(false);
                    navigate('/movies', {replace: true});
                }}>
                    <Form className='loginsignup-form'>
                        <Field name="email" type="text" placeholder="email" className='loginsignup-field' onKeyDown={removeEmailAlreadyExistsErrorMessage}  />
                        <ErrorMessage name="email" component={'div'} className='loginsignup-error-message' />
                        <div className='loginsignup-error-message'>
                            {emailAlreadyExistsError ? (
                                <span className='loginsignup-span-error-message'>Email already exists</span>
                            ) : null}
                        </div>
                        <Field name="name" type="text" placeholder="name" className='loginsignup-field' />
                        <ErrorMessage name="name" component={'div'} className='loginsignup-error-message' />
                        <Field name="password" type="password" placeholder="password" className='loginsignup-field' />
                        <ErrorMessage name="password" component={'div'} className='loginsignup-error-message' />
                        <Field name="confirmPassword" type="password" placeholder="confirm password" className='loginsignup-field' />
                        <ErrorMessage name="confirmPassword" component={'div'} className='loginsignup-error-message' />
                        <button type="submit" className="loginsignup-button"><span className='loginsignup-span'>Sign up</span></button>
                    </Form>
            </Formik>
            <div className="loginsignup-signup">
                <br />
                <span className="loginsignup-question">Already have an account? </span>
                <Link to="/login" className="loginsignup-link">Log in</Link>
            </div>
        </div>
    )
}

export default Signup;