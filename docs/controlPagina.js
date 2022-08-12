/*
En este fichero javascript se ha programado el control de la interfaz del usuario: todo lo relativo
a conmutar entre visualizacón del histórico o de las medidas actuales, descarga de ficheros CSV de las
medidas, formato numérico de los ficheros CSV, etc.
*/

// Se ha generalizado para distintos tipos de medidas: mismo código para temperatura, humedad, presión...


/////////////////////////////////////////////////////////////////////////////////////////////


// Conmutación actual / histórico

const activar_listeners_actual_historico = function (medida) {
    let selectores = document.querySelectorAll('input[name="sel_' + medida + '"]');
    for (let i=0; i< selectores.length; i++) {
        selectores[i].addEventListener("click", function() {
            let val = this.value;
            if (val=="historico") {
                activar_historico(medida);
            } else {
                desactivar_historico(medida);
                document.querySelector("#divGrafica_" + medida).classList.remove("oculto");
                document.querySelector("#divGrafica_" + medida + "_historico").classList.add("oculto");
            }
        });
    }
    
}

activar_listeners_actual_historico("temperatura");
activar_listeners_actual_historico("humedad");


// Activa el historico: invocado en activar_listeners_actual_historico
const activar_historico = function(medida) {
    document.querySelector("#dia_" + medida).removeAttribute("disabled");
    document.querySelector("#hora_" + medida).removeAttribute("disabled");
    document.querySelector("#boton_nube_" + medida).removeAttribute("disabled");

    let hay_csv = (medida=="temperatura")? hay_csv_temperatura : hay_csv_humedad;
    if (hay_csv) {
        document.querySelector("#punto_coma_decimal_csv_" + medida).classList.remove("deshabilitado");
        document.querySelector("#descargar_csv_" + medida).classList.remove("deshabilitado");
        document.querySelector("#divGrafica_" + medida).classList.add("oculto");
        document.querySelector("#divGrafica_" + medida + "_historico").classList.remove("oculto");
    }
}

// Desactiva historico: activa el actual: invocado en activar_listeners_actual_historico
const desactivar_historico = function(medida) {
    document.querySelector("#dia_" + medida).setAttribute("disabled", "");
    document.querySelector("#hora_" + medida).setAttribute("disabled", "");
    document.querySelector("#boton_nube_" + medida).setAttribute("disabled", "");
    document.querySelector("#punto_coma_decimal_csv_" + medida).classList.add("deshabilitado");
    document.querySelector("#descargar_csv_" + medida).classList.add("deshabilitado");
    document.querySelector("#divGrafica_" + medida).classList.remove("oculto");
    document.querySelector("#divGrafica_" + medida + "_historico").classList.add("oculto");
}



/////////////////////////////////////////////////////////////////////////////////////////////

// Descarga de muestras desde la nube


// Devuelve tiempo UNIX en segundos 
function tiempoUNIXs(dia, hora) {
   let fecha = new Date( dia + " " + hora + ":00" );
   return Math.floor(fecha.getTime()/1000);
}

// Variables para fichero CSV de medidas
const SEP = ";";                 // separador de columnas
const EOL = "\n";                // separador de filas: nueva línea
let ficheroCSV_prov="";               // contenido de fichero CSV
let comaCSV = true;              // números con coma (true) o punto (false) decimal
const intervalo_descarga = 3600; // segundos de medidas a partir de la hora indicada de descarga

// Si ya se ha bajado algún fichero CSV de medidas
let hay_csv_temperatura = false;
let hay_csv_humedad     = false;


// Listeners para descargar medidas desde la nube
const cargarTemperaturaForm = document.querySelector("#temperatura_dia_hora");
const cargarHumedadForm = document.querySelector("#humedad_dia_hora");

cargarTemperaturaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    traer_desde_nube("temperatura");
});
cargarHumedadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    traer_desde_nube("humedad");
});


// baja un fichero de medidas de la nube en formato CSV
function traer_desde_nube(medida){
  // hora y dia de la medida
  let dia  = document.querySelector("#dia_" + medida).value;
  let hora = document.querySelector("#hora_" + medida).value;
  // tiempo UNIX inicial de medidas
  tmin = tiempoUNIXs(dia, hora);
  // tiempo UNIX final de medidas: inicial más 1 hora (3600 s: variable intervalo_descarga)
  tmax = tmin + intervalo_descarga;
  //console.log("dia: #" + dia + "#, hora: $" + hora + "$" + "tmin: " + tmin + ", tmax: " + tmax);
  // Búsqueda en la base de datos de Firebase: medidas comprendidas entre tmin y tmax
  let valores = db.ref('historicos/sensores/' + medida).orderByChild("tiempo").startAt(tmin).endAt(tmax)
  valores.once("value", (snap) => {
    if (snap.val()==null) {
        alert("No hay registros con los datos temporales " + dia + " " + hora);
        return;
    }
    ficheroCSV_prov = "tUNIX" + SEP + "fecha" + SEP + "hora" + SEP + "medida" + SEP + "unidades" + EOL;
    let y = [];
    let x = [];
    // creación del fichero CSV
    snap.forEach(  (childSnapshot)=>{
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        console.log("childKey: "+ childKey)
        console.log("childData: " + childData)
        console.log("tiempo: " + childData.tiempo)
        console.log("valor:" + childData.valor)
        console.log("unidades:" + childData.unidades)
        let tiempo = new Date(childData.tiempo * 1000) // tiempo UNIX en ms
        let fecha = tiempo.getDate()+"/"+(tiempo.getMonth()+1)+"/"+tiempo.getFullYear(); // (D)D/(M)M/AAAA
        let instante = tiempo.getHours() + ":" + tiempo.getMinutes() + ":" + tiempo.getSeconds() + "." + tiempo.getMilliseconds(); // (h)h:(m)m:(s)s.sss
        let unidades = childData.unidades;

        ficheroCSV_prov += childData.tiempo + SEP + fecha + SEP + instante + SEP + childData.valor + SEP + unidades + EOL; 
        y.push(childData.valor);
        x.push(tiempo);
        switch(medida) {
            case "temperatura": hay_csv_temperatura = true; break;
            case "humedad":     hay_csv_humedad     = true; break;
        }
    });

    var data = [{
            x: x,
            y: y,
            mode: 'scatter',
            line: {color: '#80CAF6'}
        }]
    switch(medida) {
        case "temperatura": data[0].name='Sensor temp. 1 (histórico)';   break;
        case "humedad":     data[0].name='Sensor humedad 1 (histórico)'; break;
    }
    document.querySelector("#divGrafica_" + medida).classList.add("oculto");
    document.querySelector("#divGrafica_" + medida + "_historico").classList.remove("oculto");
    Plotly.newPlot("divGrafica_" + medida + "_historico", data, layout2, config2);

    document.querySelector("#descargar_csv_" + medida).classList.remove("deshabilitado");
    document.querySelector("#punto_coma_decimal_csv_" + medida).classList.remove("deshabilitado");
    
    //console.log(ficheroCSV);
  });
} // traer_desde_nube(medida)



// Simula clicado sobre un elemento artificialmente creado 
function descargarCSV(filename, ficheroCSV) {
    const text = (comaCSV)? ficheroCSV.replaceAll(".", ",") : ficheroCSV;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }


// Descarga de fichero de temperatura "temperatura.csv"  
let descargar_CSV_temperatura = document.querySelector("#descargar_csv_temperatura");
descargar_CSV_temperatura.addEventListener("click", (e) => {
    if (descargar_CSV_temperatura.classList.contains("deshabilitado")) return;
    descargarCSV("temperatura.csv", ficheroCSV_prov);
})  

// Descarga de fichero de humedad "humedad.csv"
let descargar_CSV_humedad = document.querySelector("#descargar_csv_humedad");
descargar_CSV_humedad.addEventListener("click", (e) => {
    if (descargar_CSV_humedad.classList.contains("deshabilitado")) return;
    descargarCSV("humedad.csv", ficheroCSV_prov);
})  




/////////////////////////////////////////////////////////////////////////////////////////////


// Control de punto o coma decimal en números del fichero CSV

let punto_coma_decimal_csv_temperatura = document.querySelector("#punto_coma_decimal_csv_temperatura");
let punto_coma_decimal_csv_humedad     = document.querySelector("#punto_coma_decimal_csv_humedad");


function comaPuntoCSV(medida) {
    let punto_coma_decimal_csv = document.querySelector("#punto_coma_decimal_csv_" + medida);
    if (punto_coma_decimal_csv.classList.contains("deshabilitado")) return;
    if (comaCSV) {
        punto_coma_decimal_csv_temperatura.innerHTML=".00";
        punto_coma_decimal_csv_humedad.innerHTML=".00";
    } else {
        punto_coma_decimal_csv_temperatura.innerHTML=",00";
        punto_coma_decimal_csv_humedad.innerHTML=",00";
    }
    comaCSV = !comaCSV;
}

punto_coma_decimal_csv_temperatura.addEventListener("click", (e) => {
    comaPuntoCSV("temperatura")
})

punto_coma_decimal_csv_humedad.addEventListener("click", (e) => {
    comaPuntoCSV("humedad")
})


