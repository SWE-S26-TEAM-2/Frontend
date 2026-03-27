"use client";

interface ILoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: ILoginModalProps) {
<<<<<<< Updated upstream
=======
  
  const [emailOrProfileUrl, setEmailOrProfileUrl] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"main" | "input" | "register" | "signin">("main");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const[captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOrProfileUrl(e.target.value);
  };
  const handleGoogleLogin = useGoogleLogin({
    onSuccess:async (response)=> {
      //console.error(response.access_token);
      try{
      setIsLoading(true);
      await AuthService.googleLogin(response.access_token);
      setIsSuccess(true);
      
      }catch{
        setError("Google login failed. Please try again.");
      }finally{
        setIsLoading(false);
      }
    },
    onError: () =>{
      setError("Google login failed. Please try again.");
    }
  })
  const handleSubmit = async () => {
    if(step === "input" || step === "main"){
    if (!emailOrProfileUrl) {
      setError("Please enter your email address.");
      return;
    }
    const isEmail = /\S+@\S+\.\S+/.test(emailOrProfileUrl);
    const isProfileUrl = emailOrProfileUrl.startsWith("soundcloud.com/");

    if (!isEmail && !isProfileUrl) {
    setError("Please enter a valid email address or profile URL.");
    return;
    }

    setError("");
    try {
      setIsLoading(true);
      //console.error("checking email:", emailOrProfileUrl);
      const { isExisting } = await AuthService.checkEmail(emailOrProfileUrl);
      //console.error("isExisting:", isExisting);
    if (isExisting) {
    setStep("signin");
    } else {
    setStep("register");
    }
    } catch {
    setError("Something went wrong. Please try again.");
    } finally {
    setIsLoading(false);
    }
  }
  if (step === "register" || step === "signin") {
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (step === "register" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (step === "register" && !captchaToken) {
      setError("Please verify you are a human.");
      return;
    }
    if (step === "signin" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    try {
      setIsLoading(true);
      if (step === "register") {
        await AuthService.register(emailOrProfileUrl, password);
        router.push("/verify-email");
        //console.error("registered:", response);
      } else {
        await AuthService.login(emailOrProfileUrl, password);
        setIsSuccess(true);
       // console.error("logged in:", response);
      }
      
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setIsLoading(false);
    }

    //console.error("submitting:", email, password);
  }
  };
  const handleEmailFocus = () => {
    setStep("input");
  };
  

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };


>>>>>>> Stashed changes
  return (
    // Overlay — dark background behind modal
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {/* Modal box — stop click from closing when clicking inside */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#222222",
          width: "400px",
          borderRadius: "8px",
          padding: "40px",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "16px",
            background: "none",
            border: "none",
            color: "#999",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
          Sign in or create an account
        </h1>
        <p style={{ color: "#999999", fontSize: "14px", lineHeight: "1.5", marginBottom: "32px" }}>
          By clicking on any of the &quot;Continue&quot; buttons below, you agree to SoundCloud&apos;s Terms of Use and acknowledge our Privacy Policy.
        </p>

        <button style={{
          backgroundColor: "#1877f2",
          color: "#ffffff",
          width: "100%",
          padding: "12px",
          borderRadius: "4px",
          border: "none",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "12px",
        }}>
          Continue with Facebook
        </button>

        <button style={{
          backgroundColor: "#333333",
          color: "#ffffff",
          width: "100%",
          padding: "12px",
          borderRadius: "4px",
          border: "none",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "12px",
        }}>
          Continue with Google
        </button>

        <button style={{
          backgroundColor: "#000000",
          color: "#ffffff",
          width: "100%",
          padding: "12px",
          borderRadius: "4px",
          border: "1px solid #444444",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "24px",
        }}>
          Continue with Apple
        </button>

        <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>
          Or with email
        </p>

        <input
          type="email"
          placeholder="Your email address or profile URL"
          style={{
            backgroundColor: "#333333",
            color: "#ffffff",
            width: "100%",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #444444",
            fontSize: "14px",
            marginBottom: "12px",
            boxSizing: "border-box",
          }}
        />

        <button style={{
          backgroundColor: "#555555",
          color: "#ffffff",
          width: "100%",
          padding: "12px",
          borderRadius: "4px",
          border: "none",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "24px",
        }}>
          Continue
        </button>

        <a style={{ color: "#f50", fontSize: "14px", cursor: "pointer" }}>
          Need help?
        </a>
      </div>
    </div>
  );
}