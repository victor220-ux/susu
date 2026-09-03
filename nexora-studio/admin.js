const APP = document.getElementById("app");
const SUPABASE_URL = "https://yzlouvxzzdhttjqdurei.supabase.co";
const SUPABASE_KEY = "sb_publishable_P3UZUHHQlxUAKtZMItX1-Q_bj2qd1ug";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Wait for the DOM content to fully load before attaching events
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const signinBtn = document.getElementById("signinBtn");
  const errorDiv = document.getElementById("err");

  // 3. Handle the login event
  signinBtn.addEventListener("click", async () => {
    // Clear previous errors and initialize loading state
    errorDiv.textContent = "";
    signinBtn.disabled = true;
    signinBtn.textContent = "Signing in...";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validate empty input fields
    if (!email || !password) {
      errorDiv.textContent = "Please enter both email and password.";
      resetButtonState();
      return;
    }

    try {
      // 4. Authenticate using Supabase Auth
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Display authentication specific errors returned by the server
        errorDiv.textContent = error.message;
        resetButtonState();
      } else {
        // Success: Redirect the user to the admin panel dashboard
        // Replace 'dashboard.html' with your target page
        window.location.href = "./dashboard.html";
      }
    } catch (err) {
      // Catch unexpected system or network errors
      errorDiv.textContent = "An unexpected error occurred. Please try again.";
      resetButtonState();
    }
  });

  // Helper function to restore the button state
  function resetButtonState() {
    signinBtn.disabled = false;
    signinBtn.textContent = "Sign in";
  }
});

