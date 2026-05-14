class PagoCredito {
    constructor(data) {
        this.idPagoDeCredito = data.idPagoDeCredito;
        this.TipoDePago = data.TipoDePago;
        this.idCreditos = data.idCreditos;
        this.AccionRealizada = data.AccionRealizada;
    }

    validate() {
        if (!this.idCreditos) throw new Error('idCreditos es requerido');
        if (!this.TipoDePago) throw new Error('TipoDePago es requerido');
        
        const tiposValidos = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque', 'Otro'];
        if (!tiposValidos.includes(this.TipoDePago)) {
            throw new Error(`TipoDePago debe ser uno de: ${tiposValidos.join(', ')}`);
        }
        
        return true;
    }

    toDatabase() {
        return {
            idPagoDeCredito: this.idPagoDeCredito,
            TipoDePago: this.TipoDePago,
            idCreditos: this.idCreditos,
            AccionRealizada: this.AccionRealizada
        };
    }
}

module.exports = PagoCredito;