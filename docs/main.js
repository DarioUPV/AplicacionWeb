const signupForm = document.querySelector("#signup-form");
const mysignUpModal = new bootstrap.Modal('#signupModal', {keyboard:true, focus:true});


const loginForm = document.querySelector("#login-form");
const myLoginModal = new bootstrap.Modal('#loginModal', {keyboard:true, focus:true});


signupForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.querySelector("#signup-email").value;
    const password = document.querySelector("#signup-password").value;
    console.log("enviando datos")
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            signupForm.reset()
            mysignUpModal.hide();
            console.log("OK sign up")
        })

})

loginForm.addEventListener('submit', e=>{
    e.preventDefault();
    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;
    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        loginForm.reset();
        myLoginModal.hide();
        console.log("OK login")
      })
})




const logout = document.querySelector("#logout")
logout.addEventListener('click', e=>{
  e.preventDefault();
  auth.signOut().then(()=>{
    console.log("signed out")
  })
})



const postList = document.querySelector(".posts")


let usuario;
// solo si esta autenticado

auth.onAuthStateChanged(user => {
  if (user) {
    usuario = user;
    getDatosIniciales();
    actualizacionAutomaticaDatos();

    console.log("auth: sign in")
  } else {
    console.log("auth: sign out")
  }
})




/**
 * Obtiene el estado en Firebase de los actuadores y de los controles y los ajusta en la página
 */
function getDatosIniciales(){
  db.ref('actuadores/control1').get().then( (instantanea) => {
    if (instantanea.exists()) {
      document.querySelector("#customRange1").value = instantanea.val();
    } else{
      document.querySelector("#customRange1").value = 50;
    }
  })
  db.ref('actuadores/control2').get().then( (instantanea) => {
    if (instantanea.exists()) {
      document.querySelector("#customRange2").value = instantanea.val();
    } else{
      document.querySelector("#customRange2").value = 0;
    }
  })
  db.ref('actuadores/actuador1').get().then( (instantanea) => {
    if (instantanea.exists()) {
      document.querySelector("#actuador1").checked = instantanea.val();
    } else{
      document.querySelector("#actuador1").checked = false;
    }
  })
  db.ref('actuadores/actuador2').get().then( (instantanea) => {
    if (instantanea.exists()) {
      document.querySelector("#actuador2").checked = instantanea.val();
    } else{
      document.querySelector("#actuador2").checked = false;
    }
  })
}
 


// Programación de actualización automática
function actualizacionAutomaticaDatos() {


  db.ref('sensores/temperatura').on('value', (instantanea) => {
    const temp = instantanea.val();
    actualizarMedidaDePlanta("#temp", +(temp.valor).toFixed(2));
    actualizarMedidaDePlanta("#unidades_temperatura", temp.unidades)
  })

  db.ref('sensores/presion').on('value', (instantanea) => {
    const press = instantanea.val();
    actualizarMedidaDePlanta("#press", +(press.valor).toFixed(2));
    actualizarMedidaDePlanta("#unidades_presion", press.unidades)

  })

  db.ref('sensores/humedad').on('value', (instantanea) => {
    const humed = instantanea.val();
    actualizarMedidaDePlanta("#hum", +(humed.valor).toFixed(2));
    actualizarMedidaDePlanta("#unidades_humedad_relativa", humed.unidades)

  })
}


function actualizarMedidaDePlanta(id, valor) {
  document.querySelector(id).innerHTML = valor;
}

 

function actuacion(checkbox) {
  if (checkbox.id=="actuador1") {
    console.log("actuador 1: " + checkbox.checked);
    db.ref('actuadores/actuador1').set(checkbox.checked)
  } else {
    console.log("actuador 2: " + checkbox.checked);
    db.ref('actuadores/actuador2').set(checkbox.checked)
  }
}


function regulador(reg) {
  if (reg.id=="regulador1") {
    db.ref("actuadores/regulador1").set(reg.value);
  } else {
    db.ref("actuadores/regulador2").set(reg.value);
  }
}

function subirDatos() {
  let objeto = {voltaje: 220}
  db.ref('datos').set(objeto);
}