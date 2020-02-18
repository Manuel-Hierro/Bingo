var jugadores = 0; // Número de jugadores para la sesión de bingo
var precio_carton = 0; // Precio del cartón (expresado en euros) para la sesión de bingo
var juegoiniciado = false; // Variable booleana (indica si el juego está iniciado, por defecto FALSE)
var velocidad = 500; // Velocidad a la que salen las bolas (expresada en milisegundos)
var bombo = []; // Array de números que contendrá siempre del 1 al 90
var numerosSacados = []; // Array de números (se sacarán del array bombo y se introducirán en numerosSacados al salir)
var intervalo_bolas; // Intervalo

function abrirVentanaCentrada(altura, anchura, html)
{
	var y = parseInt((window.screen.height/2)-(altura/2));
	var x = parseInt((window.screen.width/2)-(anchura/2));
	
	var ventana = window.open("",'_blank','width='+anchura+',height='+altura+',top='+y+',left='+x+',toolbar=no,location=no,status=no,menubar=no,scrollbars=no,directories=no,resizable=no');
	
	ventana.document.write(html);
}

function aleatorio(inicio, fin, numero)
{
	var numeros = [];
	var i = 0;
	if(!numero || numero<=0)
	{
		return Math.floor(Math.random()*(fin-inicio+1)) + inicio;
	}
	else
	{
		while(numeros.length < numero)
		{
			var aleatorios = Math.floor(Math.random()*(fin-inicio+1)) + inicio;
			if(numeros.indexOf(aleatorios) == -1)
			{
				numeros.push(aleatorios);
			}
		}
		return numeros.sort(function(a,b){return a-b;}); //Ordeno los numeros aleatorios que me han dado como resultados
	}
}

function generaCarton()
{
	var contador_huecos = 0;
	var huecos_ultima = 0;
	
	var carton=[[],[],[]];
	
	for (var j = 0; j < 9; j++)
	{
		var columna;
		if(j == 0)
		{
			columna = aleatorio(10*j+1, 10*(j+1)-1, 3);
		}
		else if(j == 8)
		{
			columna = aleatorio(10*j, 10*(j+1), 3);
		}
		else
		{
			columna = aleatorio(10*j, 10*(j+1)-1, 3);
		}
		columna.sort(function(a,b){return a-b;});
		
		for(var i = 0; i < 3; i++)
		{
			carton[i][j] = 
			{
				'valor': columna[i]
			}
		}
	}

	for(var i = 0; i < 2; i++)
	{
		var huecos = aleatorio(0,8,4);
		while(huecos.length > 0)
		{
			carton[i][huecos.shift()].valor = -1;
		}	
	}
	
	for(var x = 0; x < 9; x++)
	{
		contador_huecos = 0;
		for(var c = 0; c < 3; c++)
		{
			if(huecos_ultima != 4)
			{
				if(carton[c][x].valor == -1)
				{
					contador_huecos++;
				}
			
				if(c == 2 && contador_huecos != 2)
				{
					carton[c][x].valor = -1;
					huecos_ultima++;
					x++;
				}
			}
			else
				break;
		}
	}
	
	return carton;
}

function dibujaCarton(carton, jugador_principal = false)
{
	//Generamos la tabla
	var div = $("div:last");
	
	if(jugador_principal)
		div.append("<table id='carton_jugador' border='1'>");
	else
		div.append("<table class='carton_otros' border='1'>");
		
	//Genero las filas
	for(var i = 0; i < carton.length; i++)
	{
		var tabla_generada = $("table:last");
		tabla_generada.append("<tr>");
		
		//Genero las columnas
		for(var j = 0; j < carton[i].length; j++)
		{
			var fila = $("table:last tr:last");
			fila.append("<td></td>");
			
			if(carton[i][j].valor === -1)
			{
				$("table:last tr:last td:last").addClass('vacio');
			}
			else
			{
				$("table:last tr:last td:last").text(carton[i][j].valor);
			}	
		}
		tabla_generada.append("</tr>");
	}
	div.append("</table><br>");
	
	if(jugador_principal)
		div.append("<div class='centrar'><button id='comprobar_bingo'>COMPROBAR BINGO</button></div>");
}

function init()
{
	$("h2:last").removeAttr("hidden");
	$("table:last").removeAttr("hidden");
	
	jugadores = $("#jugadores_input").val(); // Le damos a la variable 'jugadores' el valor del input
	precio_carton = $("#euros").val(); // Le damos a la variable 'precio_carton' el valor del select de cantidad
	velocidad = $("#milisegundos").val(); // Le damos a la variable 'velocidad' el valor el milisegundos del select
	
	juegoiniciado = true; // Iniciamos el juego
	
	var contenedor_derecho = $("#contenedor_der"); // Lado derecho de la web
	contenedor_derecho.append("<div class='width_entero'><p id='numero'></p></div>"); // Añadimos el círculo donde irán saliendo los números del bombo

	for(var i = 0; i < jugadores; i++) // Por cada jugador se creará un carton
	{
		if(i != 0)
		{
			if(i % 2 != 0)
			{
				contenedor_derecho.append("<div class='carton_izq'>");
			}
			else
			{
				contenedor_derecho.append("<div class='carton_der'>");
			}
		}
		var carton = generaCarton(); // Genera un cartón
		dibujaCarton(carton, i == 0 ? true : false); // Aquí lo dibuja, diferenciando si es el primer cartón (el nuestro) o los siguientes (de otros)
		
		contenedor_derecho.append("</div>");
	}
	
	for(var x = 1; x < 91; x++) // Rellenamos el bombo con todos los números que pueden salir... (del 1 al 90)
	{
		bombo.push(x); // Añadimos el número al array bombo
	}
	
	var tabla = $("#tabla_numeros");
	var primer_numero = 1;
	var ultimo_numero = 10;
	for(var a = 0; a < 10; a++)
	{
		tabla.append("<tr>");
		for(var b = primer_numero; b < ultimo_numero; b++)
		{
			tabla.append("<td>"+ b +"</td>");
		}
		if(ultimo_numero != 90)
		{
			primer_numero += 9;
			ultimo_numero += 9;
		}
		tabla.append("</tr>");
	}
	
	intervalo_bolas = setInterval(peticionAJAX, velocidad);
	
	$("#comprobar_bingo").click(function() {
		if(juegoiniciado)
		{
			if(numerosSacados.length >= 15)
			{
				comprobarBingoJugador();
			}
			else
				alert("Debe esperar a que salgan minimo 15 bolas del bombo");
		}
		else
			alert("El juego no esta activo");
	});
	
}

function marcarNumeroSalido(numero)
{
	var jugador = $("#carton_jugador td");
	var cartones_otros = $(".carton_otros td");
	var tabla_salidos = $("#tabla_numeros td");
	tabla_salidos.each(function()
	{
		if($(this).text().trim() == numero)
		{
			$(this).css("background-color", "#ff8080");
		}
	});
	
	cartones_otros.each(function()
	{
		if($(this).text().trim() == numero)
		{
			$(this).addClass("tachado");
		}
	});
}

function peticionAJAX() {
  $.ajax({
    type: "POST",
    url: "numero.php",
    data: { numeros : bombo },
    dataType: "text",
    success: sacarBola,
  });
}

function sacarBola(indice)
{
    nbola = bombo[indice];

	numerosSacados.push(nbola);
	  
	if(numerosSacados.length <= 90)
	{
		bombo.splice(indice, 1);
		$("#numero").text(nbola);
		marcarNumeroSalido(nbola);
		comprobarCartones();
	}
	else
	{
		alert("Se han sacado todos los números...");
	}
}

function comprobarCartones(bingo_principal = "")
{
	var aciertos = 0;
	var ganadores = "";
	var num_ganadores = 0;
	
	var cartones = $(".carton_otros");
	for(var i = 0; i < cartones.length; i++)
	{
		aciertos = 0;
		
		var columnas = cartones.eq(i).find("td");
		for(var j = 0; j < columnas.length; j++)
		{
			if(!columnas.eq(j).hasClass("vacio"))
			{
				if(columnas.eq(j).hasClass("tachado") && jQuery.inArray(columnas.eq(j).text().trim(), numerosSacados))
				{
					aciertos++;
					if(aciertos == 15)
					{
						ganadores+="El cartón número " + (i+1) + " tiene bingo<br>";
						num_ganadores++;
						clearInterval(intervalo_bolas);
					}
				}
			}
		}
	}
	
	if(bingo_principal != "") num_ganadores++;	
	
	if(ganadores != "" || bingo_principal != "")
	{
		ganadores = ganadores+"<br>El premio para cada jugador con cartón premiado es de: "+(jugadores*precio_carton)/num_ganadores*0.8+"€";
			
		if(bingo_principal == "")
		{
			abrirVentanaCentrada(410, 520, "<body><h1>Bingos comprobados</h1><br><br>"+ganadores+"<br><br><button style='margin:10px auto; display:block;' onClick='window.close()'>Cerrar ventana</button></body>");
		}
		else
		{
			abrirVentanaCentrada(410, 520, bingo_principal+"<body><h1>Bingos comprobados</h1><br><br>"+ganadores+"<br><br><button style='margin:10px auto; display:block;' onClick='window.close()'>Cerrar ventana</button></body>");
		}
	}
}

function comprobarBingoJugador()
{
	var aciertos = 0;
	
	var carton = $("#carton_jugador td");
	for(var i = 0; i < carton.length; i++)
	{
		if(carton.eq(i).hasClass("tachado") && numerosSacados.includes(parseInt(carton.eq(i).text().trim())))
		{
			aciertos++;
			if(aciertos == 15)
			{
				clearInterval(intervalo_bolas);
				comprobarCartones("<h1 style='color:green'>¡Felicidades! Has cantado bingo, pero podría haber otros</h1>");
			}
		}
	}
	if(aciertos < 15)
	{
		abrirVentanaCentrada(410, 520, "<body><br><br><h1 style='color: red; text-align: center;'>No tienes Bingo</h1><br><br><p style='text-align:center;'>Continue jugando</p><br><br><button style='margin:10px auto; display:block;' onClick='window.close()'>Cerrar Ventana</button></body>");
	}
}

function generarEventos()
{
	$("#carton_jugador td").click(function() {
		if(!$(this).hasClass("vacio"))
		{
			if(!$(this).hasClass("tachado"))
			{
				$(this).addClass("tachado");
			}
			else
			{
				$(this).removeClass("tachado");
			}
		}
	});
}

$(document).ready(function() {
	$("#boton_formulario").click(function() {
		var jugadores_input = $("#jugadores_input").val();
		if(!juegoiniciado)
		{
			if(jugadores_input >= 5 && jugadores_input <= 20)
			{
				init();
				generarEventos();
			}
			else
				alert("Especifique la cantidad de jugadores (entre 5 y 20)");
		}
		else
			alert("Ya hay un juego iniciado...");
	});
});