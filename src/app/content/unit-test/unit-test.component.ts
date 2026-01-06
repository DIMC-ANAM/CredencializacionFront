import { Component, OnInit, ViewChild, Input  } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-unit-test',
  standalone: false,
  templateUrl: './unit-test.component.html',
  styleUrl: './unit-test.component.scss'
})
export class UnitTestComponent {
	
	urlBase: String = environment.baseurl;
	idReporteRobo:any= null;
	frmRegistro!: FormGroup;
	maxDate:any = new Date;


	catPerifericos=[
		"Laptop",
		"Teclado",
		"Mouse",
		"Eliminador de corriente (cargador)",
		"Docking",
		"Monitor",
		"CPU",
		"Candado",
		"NoBreak",
		"Tableta",
		"Bocinas",
		"Cámara web",
		"Unidad de DVD USB",
		"Biométrico",
		"Lector de código de barras",
		"Proyector",
	];
	unidadesAdministrativas:any = null;
	datasetPersona:any = null;
	datasetSerie:any = null;
	/* variables del formulario */
	idUr:any=null;
	dgticID:any= null;
	idOficialResguardanteFile:any[]=[];
	seriePrincipal:any=null;
	resguardoFile:any[]=[];
	equipoCifrado:any=null;
	descripcionGeneralInformacion:any=null;
	perifericosList:any[]=[];
	perifericoItemNombre:any=null;  
	perifericoItemSerie:any=null;
	tipoSiniestro:any=null;
	fechaSiniestro:any=null;
	lugarSiniestro:any=null;
	domicilioSiniestro:any=null;
	actaHechosFile:any[]=[];
	actaMinisterialFile:any[]=[];
	noAverigauacion:any=null;
	fechaDenuncia:any=null;
	nombreMP:any=null;
	oficiosFile:any[]=[];

	nombreSolicita:any = null;

	existenCamaras:any=null;
	daniosinstalaciones:any=null;
	fotos:any=[];
	observaciones:any=null;

	/* Banderitas */
	inmuebleSEP:Boolean = false;
	edificios:any[]=[];
	direccionInmueble:any='';
	domicilioInputContent:any = '';
	errorFileMessage:string= "";
	/* ************************ */

	/* archivitos c: */	

	usuario: any;
	perifericos:any=[];

	/* consultas */
	urString:any = null;
	nombreDenuncia:any = null;

	/* para el modal de borrar */
	currentIndex:any = null; 
	currentFileList:any = null; 
	currentId:any = null; 
	currentIcon:any = null; 

  constructor (){}

  ngOnInit(): void {
    					
	
	
  }
}
