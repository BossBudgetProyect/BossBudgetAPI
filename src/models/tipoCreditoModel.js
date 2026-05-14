class TipoCredito {
    constructor(data) {
        this.idTipoDeCredito = data.idTipoDeCredito;
        this.TipoDeCredito = data.TipoDeCredito;
    }

    validate() {
        if (!this.TipoDeCredito || this.TipoDeCredito.trim() === '') {
            throw new Error('TipoDeCredito es requerido');
        }
        return true;
    }

    toDatabase() {
        return {
            idTipoDeCredito: this.idTipoDeCredito,
            TipoDeCredito: this.TipoDeCredito
        };
    }
}

module.exports = TipoCredito;