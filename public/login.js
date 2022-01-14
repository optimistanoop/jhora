
class JhoraLogin {
  constructor(fw){
    this.auth = fw.auth
    let submitbtn  = document.getElementById('submitbtn');
    let resetBtn  = document.getElementById('resetBtn');
    submitbtn.onclick = this.signIn.bind(this);
    resetBtn.onclick = this.resetPwd.bind(this);
    this.checkLogin();
  }

   signIn() {
      let email = document.getElementById("email").value;
      let password = document.getElementById("password").value;
      if(!email || !password){ alert('Please provide all details'); return }

      return this.auth.signInWithEmailAndPassword(email, password)
      .then((userExists)=>{
        if(userExists){
          let currentUser = this.auth.currentUser;
          window.location.href = 'home.html'
          return false;
        }else{
            alert('Some error occurred')
        }
      })
      .catch(function(error) {
        alert("Wrong Username or password, Please try again....");
        console.log(error);
      });
  }

  checkLogin(){
    this.auth.onAuthStateChanged(function(user) {
      if (user) {
        window.location.replace("home.html");
        return false;
      } else {
        console.log('anp user is logged out');
      }
      return false;
    });
  }

  resetPwd(){
    let email = document.getElementById("email").value;
    console.log('email', email)
    if(!email){return alert('Please fill email')}
    return this.auth.sendPasswordResetEmail(email).then((data)=>{
      return alert('an email is sent to reset password')
    })
    .catch((e)=>{
      if(e){alert('an error occurred, please check email')}
    })
  }
}

new JhoraLogin(new FirebaseWrapper());
