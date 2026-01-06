function initDatePicker() {
    $('#fechaIngresoDate').datepicker(
        {
            maxDate: new Date(),
            changeYear: true,
            yearRange: "1950:+0",
            onClose: (dateText, inst) => {
                let fecha
                try {
                    fecha = $.datepicker.parseDate("dd/mm/yy", dateText);    
                    
                    window.angularComponentReference.zone.run(() => {
                        window.angularComponentReference.setFechaIngreso(dateText);
                    });
                } catch (error) {                    
                    $('#fechaIngresoDate').val('')
                }  
                //$("#fechaIngresoDate").val(dateText);
                //onClose_(dateText);
                //this.frmRegistro.controls['fechaIngresoDate'].setValue(dateText);
            }
        });
}

function initDatePickerFiltroConsulta() {
    $('#fechaInicio').datepicker(
        {
            changeYear: true,
            onClose: (dateText, inst) => {
                $("#fechaFin").datepicker("option", "minDate", dateText);
                window.angularComponentReference.zone.run(() => {
                    window.angularComponentReference.setFecha(1, dateText);
                });
            }
        });

    $('#fechaFin').datepicker(
        {
            changeYear: true,
            onClose: (dateText, inst) => {
                $("#fechaInicio").datepicker("option", "maxDate", dateText);
                window.angularComponentReference.zone.run(() => {
                    window.angularComponentReference.setFecha(2, dateText);
                });
            }
        });
}