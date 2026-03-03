export default function Home() {
  return (
    <div style={{ backgroundColor: "#1a1a1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "#222222", width: "400px", borderRadius: "8px", padding: "40px" }}>
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
          marginBottom: "12px"
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
  marginBottom: "12px"
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
  marginBottom: "24px"
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
    boxSizing: "border-box"
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
  marginBottom: "24px"
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