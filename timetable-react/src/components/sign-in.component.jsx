import { signInWithGooglePopup } from "../utils/firebase.utils";
const SignIn = () => {
  const logGoogleUser = async () => {
    const response = await signInWithGooglePopup();
    console.log(response);
  };
  return (
    <div>
      <button onClick={logGoogleUser} className="border p-4">
        Sign In
      </button>
    </div>
  );
};
export default SignIn;
