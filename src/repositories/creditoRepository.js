class CreditoRepository {
    constructor(db, isMySQL = false) {
        this.db = db;
        this.isMySQL = isMySQL;
    }

    // Crear crédito
    async create(credito) {
        const query = `
            INSERT INTO creditos 
            (idPresupuesto, RangoInicial, RangoFinal, MontoTotal, idTipoDeCredito)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const values = [
            credito.idPresupuesto,
            credito.RangoInicial,
            credito.RangoFinal,
            credito.MontoTotal,
            credito.idTipoDeCredito
        ];

        try {
            const result = await this.db.execute(query, values);
            return this.isMySQL ? result[0].insertId : result.lastID;
        } catch (error) {
            throw new Error(`Error al crear crédito: ${error.message}`);
        }
    }

    // Obtener crédito por ID
    async findById(id) {
        const query = `
            SELECT c.*, tc.TipoDeCredito 
            FROM creditos c
            LEFT JOIN tipodecredito tc ON c.idTipoDeCredito = tc.idTipoDeCredito
            WHERE c.idCreditos = ?
        `;
        
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    // Obtener créditos por presupuesto
    async findByPresupuesto(idPresupuesto) {
        const query = `
            SELECT c.*, tc.TipoDeCredito 
            FROM creditos c
            LEFT JOIN tipodecredito tc ON c.idTipoDeCredito = tc.idTipoDeCredito
            WHERE c.idPresupuesto = ?
            ORDER BY c.RangoInicial DESC
        `;
        
        const [rows] = await this.db.execute(query, [idPresupuesto]);
        return rows;
    }

    // Obtener todos los créditos de un usuario
    async findByUsuario(nombreUsuario) {
        const query = `
            SELECT c.*, tc.TipoDeCredito, p.NombreUsuario
            FROM creditos c
            LEFT JOIN tipodecredito tc ON c.idTipoDeCredito = tc.idTipoDeCredito
            INNER JOIN presupuesto p ON c.idPresupuesto = p.idPresupuesto
            WHERE p.NombreUsuario = ?
            ORDER BY c.RangoInicial DESC
        `;
        
        const [rows] = await this.db.execute(query, [nombreUsuario]);
        return rows;
    }

    // Actualizar crédito
    async update(id, creditoData) {
        const query = `
            UPDATE creditos 
            SET RangoInicial = ?, RangoFinal = ?, MontoTotal = ?, idTipoDeCredito = ?
            WHERE idCreditos = ?
        `;
        
        const values = [
            creditoData.RangoInicial,
            creditoData.RangoFinal,
            creditoData.MontoTotal,
            creditoData.idTipoDeCredito,
            id
        ];

        await this.db.execute(query, values);
        return this.findById(id);
    }

    // Eliminar crédito
    async delete(id) {
        const query = 'DELETE FROM creditos WHERE idCreditos = ?';
        await this.db.execute(query, [id]);
        return true;
    }

    // Obtener resumen de créditos por usuario
    async getResumenByUsuario(nombreUsuario) {
        const query = `
            SELECT 
                COUNT(c.idCreditos) as totalCreditos,
                SUM(c.MontoTotal) as montoTotal,
                COALESCE(SUM(pc.Monto), 0) as montoPagado,
                COUNT(DISTINCT tc.idTipoDeCredito) as tiposCredito
            FROM creditos c
            INNER JOIN presupuesto p ON c.idPresupuesto = p.idPresupuesto
            LEFT JOIN pagodecredito pc ON c.idCreditos = pc.idCreditos
            LEFT JOIN tipodecredito tc ON c.idTipoDeCredito = tc.idTipoDeCredito
            WHERE p.NombreUsuario = ?
        `;
        
        const [rows] = await this.db.execute(query, [nombreUsuario]);
        const resumen = rows[0];
        
        if (resumen) {
            resumen.pendiente = (resumen.montoTotal || 0) - (resumen.montoPagado || 0);
        }
        
        return resumen || { totalCreditos: 0, montoTotal: 0, montoPagado: 0, pendiente: 0, tiposCredito: 0 };
    }
}

module.exports = CreditoRepository;