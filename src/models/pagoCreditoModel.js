// models/pagoCreditoModel.js
class PagoCredito {
    constructor(data) {
        this.idPagoDeCredito = data.idPagoDeCredito;
        this.TipoDePago = data.TipoDePago;
        this.idCreditos = data.idCreditos;
        this.Monto = data.Monto || data.monto || 0;  // ← Aceptar ambas formas
        this.AccionRealizada = data.AccionRealizada;
        this.FechaPago = data.FechaPago;
    }

    validate() {
        if (!this.idCreditos) throw new Error('idCreditos es requerido');
        if (!this.Monto || this.Monto <= 0) throw new Error('Monto debe ser mayor a 0');
        return true;
    }

    toDatabase() {
        return {
            TipoDePago: this.TipoDePago,
            idCreditos: this.idCreditos,
            Monto: this.Monto,  // ← Asegurar que es Monto (mayúscula)
            AccionRealizada: this.AccionRealizada,
            FechaPago: this.FechaPago || new Date().toISOString().split('T')[0]
        };
    }
}

module.exports = PagoCredito;