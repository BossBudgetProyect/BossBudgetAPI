class Meta {
    constructor(idMeta, NombreUsuario, NombreMeta, Descripcion, MontoObjetivo, MontoActual, FechaInicio, FechaLimite, Estado) {
        this.idMeta = idMeta;
        this.NombreUsuario = NombreUsuario;
        this.NombreMeta = NombreMeta;
        this.Descripcion = Descripcion;
        this.MontoObjetivo = MontoObjetivo;
        this.MontoActual = MontoActual;
        this.FechaInicio = FechaInicio;
        this.FechaLimite = FechaLimite;
        this.Estado = Estado;
    }

    toJSON() {
        return {
            idMeta: this.idMeta,
            NombreUsuario: this.NombreUsuario,
            NombreMeta: this.NombreMeta,
            Descripcion: this.Descripcion,
            MontoObjetivo: this.MontoObjetivo,
            MontoActual: this.MontoActual,
            FechaInicio: this.FechaInicio,
            FechaLimite: this.FechaLimite,
            Estado: this.Estado,
            progreso: this.calcularProgreso()
        };
    }

    calcularProgreso() {
        if (this.MontoObjetivo > 0) {
            return (this.MontoActual / this.MontoObjetivo) * 100;
        }
        return 0;
    }
}

module.exports = Meta;