// Comunicación con Firebase


// Se pierde la autenticacion cuando se cierra la sesión
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)



// Modal del Sign-up o registro
const mysignUpModal = new bootstrap.Modal('#signupModal', {keyboard:true, focus:true});
const signupForm = document.querySelector("#signup-form");
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

// Identificador
let usuarioEmail;

// Modal del login o entrada
const myLoginModal = new bootstrap.Modal('#loginModal', {keyboard:true, focus:true});
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener('submit', e=>{
    e.preventDefault();
    const email = document.querySelector("#login-email").value;
    usuarioEmail = email;
    const password = document.querySelector("#login-password").value;
    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        loginForm.reset();
        myLoginModal.hide();
        document.querySelector("#principal").classList.remove("desaparecido");
        console.log("OK login")
        document.querySelector("#usuario_entrada").classList.add("oculto");
        document.querySelector("#usuario_registro").classList.add("oculto");
        document.querySelector("#usuario_nombre").classList.remove("oculto");
        document.querySelector("#usuarioEmail").innerHTML = usuarioEmail;
      }).catch((e)=>{
        alert("Error en email/password");
      })
})



// Logout: se eliminar la autenticación, contacto con FB y recarga ventana
const logout = document.querySelector("#logout")
logout.addEventListener('click', e=>{
  e.preventDefault();
  auth.signOut().then(()=>{
    console.log("signed out")
    db.goOffline();
    window.location.reload();
  })
})



//let usuario;

// cambio en el estatus del usuario
auth.onAuthStateChanged(user => {
  if (user) { // autenticación OK
    //usuario = user;
    actualizacionAutomaticaTelemetria();  // se pide actualización de telemetría
    actualizacionAutomaticaTeleControl(); // se pide actualización de telecontrol
    console.log("auth: sign in")
  } else {
    console.log("auth: sign out")
  }
})




// Actualización automática de telecontrol: cualquier modificación en la base de datos
// se verá reflejada localmente, haya sido este usuario el promotor de dicho cambio o no.
function actualizacionAutomaticaTeleControl() {
  // Actualización del actuador 1
  db.ref('actuadores/actuador1').on('value', (instantanea) => {
    const valor = instantanea.val();
    document.querySelector("#actuador1").checked = valor;
  })
  // Actualización del actuador 2
  db.ref('actuadores/actuador2').on('value', (instantanea) => {
    const valor = instantanea.val();
    document.querySelector("#actuador2").checked = valor;
  })
  // Actualización del regulador 1
  db.ref('actuadores/regulador1').on('value', (instantanea) => {
    const valor = instantanea.val();
    document.querySelector("#regulador1").value = valor;
    document.querySelector("#val_regulador_1").innerHTML = "("+valor+")";

  })
  // Actualización del regulador 2
  db.ref('actuadores/regulador2').on('value', (instantanea) => {
    const valor = instantanea.val();
    document.querySelector("#regulador2").value = valor;
    document.querySelector("#val_regulador_2").innerHTML = "("+valor+")";
  })
}


// Programación de actualización automática de telemetría
function actualizacionAutomaticaTelemetria() {

  // Actualización de temperatura: tanto reloj como gráfica de valores actuales
  db.ref('sensores/temperatura').on('value', (instantanea) => {
    const temp = instantanea.val();

    let dato = +(temp.valor).toFixed(2);
    actualizar_indicador(indicador_temperatura, null, dato, 'divReloj_temperatura', layout1, config1);

    actualizar_grafica('divGrafica_temperatura', new Date(), dato);
  })

  //db.ref('sensores/presion').on('value', (instantanea) => {
  //  const press = instantanea.val();
  //})

  // Actualización de humedad: tanto reloj como gráfica de valores actuales
  db.ref('sensores/humedad').on('value', (instantanea) => {
    const humed = instantanea.val();

    let dato = +(humed.valor).toFixed(2);
    actualizar_indicador(indicador_humedad, null, dato, 'divReloj_humedad', layout3, config3);
    
    actualizar_grafica('divGrafica_humedad', new Date(), dato);

  })
}


// Accion sobre acuadores: indicación a FireBase
function actuacion(checkbox) {
  if (checkbox.id=="actuador1") {
    console.log("actuador 1: " + checkbox.checked);
    db.ref('actuadores/actuador1').set(checkbox.checked)
  } else {
    console.log("actuador 2: " + checkbox.checked);
    db.ref('actuadores/actuador2').set(checkbox.checked)
  }
}

// Accion sobre reguladores: indicación a FireBase
function regulador(reg) {
  if (reg.id=="regulador1") {
    db.ref("actuadores/regulador1").set(+(reg.value));
    document.querySelector("#val_regulador_1").innerHTML="("+reg.value+")";
  } else if ((reg.id=="regulador2") ){
    db.ref("actuadores/regulador2").set(+(reg.value));
    document.querySelector("#val_regulador_2").innerHTML="("+reg.value+")";
  }
}





