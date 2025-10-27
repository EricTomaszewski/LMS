    import React, { useState } from 'react';

    const LoginScreen = ({ auth, firebase }) => {
        const [isSignUp, setIsSignUp] = useState(false);
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');

        const handleGoogleSignIn = () => {
            const provider = new firebase.GoogleAuthProvider();
            firebase.signInWithPopup(auth, provider).catch(err => setError(err.message));
        };

        const handleEmailAuth = (e) => {
            e.preventDefault();
            setError('');
            if (isSignUp) {
                firebase.createUserWithEmailAndPassword(auth, email, password)
                    .catch(err => setError(err.message));
            } else {
                firebase.signInWithEmailAndPassword(auth, email, password)
                    .catch(err => setError(err.message));
            }
        };
        
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-800">
                        {isSignUp ? 'Create an Account' : 'Sign In'}
                    </h2>
                    
                    <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22.05 12.18c0-.77-.07-1.53-.2-2.28H12v4.3h5.64c-.24 1.48-1.2 2.75-2.6 3.63v2.81h3.6a10.36 10.36 0 003.21-7.46z" clipRule="evenodd"/><path fillRule="evenodd" d="M12 22.5c2.98 0 5.46-1 7.25-2.72l-3.6-2.81c-.98.66-2.23 1.06-3.65 1.06-2.8 0-5.18-1.89-6.03-4.43H2.25v2.9C4.08 20.44 7.74 22.5 12 22.5z" clipRule="evenodd"/><path fillRule="evenodd" d="M5.97 13.9a6.37 6.37 0 010-3.8V7.2H2.25A10.46 10.46 0 001.5 12c0 1.61.38 3.14 1.05 4.51l3.72-2.9v-.71z" clipRule="evenodd"/><path fillRule="evenodd" d="M12 5.25c1.54 0 2.9.54 3.98 1.5l3.2-3.2A10.2 10.2 0 0012 1.5C7.74 1.5 4.08 3.56 2.25 7.2l3.72 2.9c.85-2.54 3.23-4.43 6.03-4.43z" clipRule="evenodd"/></svg>
                        Sign in with Google
                    </button>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200" />
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-sm text-center text-gray-600">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-medium text-blue-600 hover:text-blue-500">
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        );
    };

    export default LoginScreen;
    
