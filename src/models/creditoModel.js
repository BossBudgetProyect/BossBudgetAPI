class Credito {
    constructor(data) {
        this.idCreditos = data.idCreditos;
        this.idPresupuesto = data.idPresupuesto;
        this.RangoInicial = data.RangoInicial;
        this.RangoFinal = data.RangoFinal;
        this.MontoTotal = data.MontoTotal;
        this.idTipoDeCredito = data.idTipoDeCredito;
        this.pagos = data.pagos || []; // Para cargar pagos relacionados
    }

    // Validar datos antes de crear/actualizar
    validate() {
        if (!this.idPresupuesto) throw new Error('idPresupuesto es requerido');
        if (!this.MontoTotal || this.MontoTotal <= 0) throw new Error('MontoTotal debe ser mayor a 0');
        if (!this.idTipoDeCredito) throw new Error('idTipoDeCredito es requerido');
        
        if (this.RangoInicial && this.RangoFinal && new Date(this.RangoInicial) > new Date(this.RangoFinal)) {
            throw new Error('RangoInicial no puede ser mayor a RangoFinal');
        }
        
        return true;
    }

    // Convertir para base de datos
    toDatabase() {
        return {
            idCreditos: this.idCreditos,
            idPresupuesto: this.idPresupuesto,
            RangoInicial: this.RangoInicial,
            RangoFinal: this.RangoFinal,
            MontoTotal: this.MontoTotal,
            idTipoDeCredito: this.idTipoDeCredito
        };
    }
}

module.exports = Credito;