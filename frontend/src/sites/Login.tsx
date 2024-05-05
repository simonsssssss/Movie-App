import { gql, useMutation, useQuery } from '@apollo/client';
import { ErrorMessage, Field, Form, Formik } from 'formik'; 
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginSignup.css';
import { useRef, useState } from 'react';
import { GET_USER_DATA_QUERY } from './Signup';

const LOGIN_MUTATION = gql`
mutation login($email: String!, $password: String!){
    login(email: $email, password: $password){
        token
    }
}
`;

interface LoginValues{
    email: string,
    password: string
}

function Login(){
    const navigate = useNavigate();
    const [emailDoesNotExistError, setEmailDoesNotExistError] = useState(false);
    const [mutateLogin] = useMutation(LOGIN_MUTATION); // returns a tuple consisting of a mutate function that you can call at any time to execute the mutation and an object with fields that represent the current status of the mutation's execution (data, loading, etc.)
    const initialValues: LoginValues = {
        email: '',
        password: ''
    }
    const validationSchema = yup.object({
        email: yup.string().email("Invalid email address").required("Email required"), // defines a string schema
        password: yup.string().max(20, '20 characters or less').required("Password required"),
    })
    const formikReference = useRef(null);
    const {data} = useQuery(GET_USER_DATA_QUERY);
    let usersEmails: any[] = [];
    function checkIfEmailExists() {
        setEmailDoesNotExistError(false);
        if(data.users && formikReference.current.values.email) {
            usersEmails = [];
            data.users.forEach(function(user: any) {
                usersEmails.push(user.email);
            });
            if(!usersEmails.includes(formikReference.current.values.email)) {
                setEmailDoesNotExistError(true);
            }
        }
    }
    function removeEmailDoesNotExistMessage() {
        setEmailDoesNotExistError(false);
    }
    return(
        <div className='loginsignup-container'>
            <i id='loginsignup-logo' className='fa-solid fa-film' aria-hidden="true"></i>
            <h3 className='loginsignup-h3'>Log in</h3>
            <Formik
                innerRef={formikReference}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values,{setSubmitting}) => {
                    setSubmitting(true);
                    checkIfEmailExists();
                    const response = await mutateLogin({ variables: values});
                    localStorage.setItem("Movie App Authentication Token", response.data.login.token);
                    setSubmitting(false);
                    navigate('/movies', {replace: true});
                }}>
                    <Form className='loginsignup-form'>
                        <Field name="email" type="text" placeholder="email" className='loginsignup-field' onKeyDown={removeEmailDoesNotExistMessage} />
                        <ErrorMessage name="email" component="div" className="loginsignup-error-message" />
                        <div className='loginsignup-error-message'>
                            {emailDoesNotExistError ? (
                                <span className='loginsignup-span-error-message'>Email does not exist</span>
                            ) : null}
                        </div>
                        <Field name="password" type="password" placeholder="password" className='loginsignup-field' />
                        <ErrorMessage name="password" component="div" className="loginsignup-error-message" />
                        <button type="submit" className="loginsignup-button"><span className='loginsignup-span'>Log in</span></button>
                    </Form>
            </Formik>
            <div className="loginsignup-signup">
                <br />
                <span className="loginsignup-question">Don't have an account? </span>
                <Link to="/signup" className="loginsignup-link">Sign up</Link>
            </div>
        </div>
    )
}

export default Login;