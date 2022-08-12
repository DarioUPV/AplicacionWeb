// Control sobre relojes y graficas de medidas realizadas con librería plotly
// Referencia: https://plotly.com/javascript/



// Dimensiones de los relojes y las gráficas para plotly      

let width_indicadores  = 300;
let height_indicadores = 250;

let width_graficas   = 350;
let height_graficas = 300;



// Características de los indicadores de tempertura y humedad

indicador_temperatura = { 
  type: "indicator",
  value: 50,
  delta: { reference: 50 },
  gauge: { axis: { visible: true, range: [-50, 150] } },
}

indicador_humedad = {
    type: "indicator",
    value: 50,
    delta: { reference: 50 },
    gauge: { axis: { visible: true, range: [0, 100] } },
}




// Layout para plotly del reloj (temp.)

let layout1 = {
    width: width_indicadores,
    height: height_indicadores,
    template: {
      data: {
        indicator: [
          {
            title: { text: "Temperatura (ºC)" },
            mode: "number+delta+gauge",
            delta: { reference: -50 }
          }
        ]
      }
    }    
}




// Layout para plotly de la gráfica (temp.)

let layout2 = {
  width: width_graficas,
  height: height_graficas,
  showlegend: true,
  legend: {
    x: 1,
    xanchor: 'right',
    y: 1.2
  },
  xaxis: {
    title: {
      text: 't',
      font: {
        family: 'Courier New, monospace',
        size: 14,
        color: '#7f7f7f'
      }
    }
  },
  yaxis: {
    title: {
      text: 'Temperatura (ºC)',
      font: {
        family: 'Courier New, monospace',
        size: 14,
        color: '#7f7f7f'
      }
    }
  },
}


// Layout para plotly del reloj (humedad)

let layout3 = {
  width: width_indicadores,
  height: height_indicadores,
  template: {
    data: {
      indicator: [
        {
          title: { text: "Humedad relativa (%)" },
          mode: "number+delta+gauge",
          delta: { reference: -50 }
        }
      ]
    }
  }    
}


// Layout para plotly de la gráfica (humedad)

let layout4 = {
  width: width_graficas,
  height: height_graficas,
  showlegend: true,
  legend: {
    x: 1,
    xanchor: 'right',
    y: 1.2
  },
  xaxis: {
    title: {
      text: 't',
      font: {
        family: 'Courier New, monospace',
        size: 14,
        color: '#7f7f7f'
      }
    }
  },
  yaxis: {
    title: {
      text: 'Humedad relativa (%)',
      font: {
        family: 'Courier New, monospace',
        size: 14,
        color: '#7f7f7f'
      }
    }
  },
}


  
// configuración para reloj de temperatura
let config1={
    responsive: true, 
    scrollZoom: false,
    toImageButtonOptions: {
        format: 'png', // one of png, svg, jpeg, webp
        filename: 'medida.png',
        height: 500,
        width: 700,
        scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
      },
    displayModeBar: true
  };

  // misma configuración para resto de relojes y gráficas
  config2 = config1;
  config3 = config1;
  config4 = config1;


  // Inic. indicador humedad
  Plotly.newPlot('divReloj_temperatura',  [indicador_temperatura], layout1, config1);
  // Inic. indicador temperatura 
  Plotly.newPlot('divReloj_humedad', [indicador_humedad], layout3, config3);


  // Inic gráfica de humedad 
  let data2 = [{
    x: [],
    y: [],
    name: 'Sensor temp. 1', 
    mode: 'scatter',
    line: {color: '#80CAF6'}
  }]
  Plotly.newPlot('divGrafica_temperatura', data2, layout2, config2);


  // Inic. gráfica de temperatura 
  var data4 = [{
    x: [],
    y: [],
    name: 'Sensor humedad 1', 
    mode: 'scatter',
    line: {color: '#80CAF6'}
  }]
  Plotly.newPlot('divGrafica_humedad', data4, layout4, config4);





// Actualizacíon del reloj por nuevo dato
let actualizar_indicador = function(indicador, x, dato, div, layout, config) {

  indicador.delta.reference = indicador.value
  indicador.value = dato;
  
  Plotly.animate(div, 
      {
          data: [{x:x, y: dato}],
          traces: [0],
          layout: layout //{}
      }, 
      {
          transition: {
                          duration: 2500,
                          easing: 'cubic-in-out'
          },
          frame: {
              duration: 2500
          }
      },
      config);
  
  } // actualizar_indicador
  
  
  // Actualización de la gráfica por nuevo dato (acumulativo)
  let actualizar_grafica = function (div, x, y) {
    Plotly.extendTraces(div, {x: [[x]], y: [[y]]}, [0]);
  }
  