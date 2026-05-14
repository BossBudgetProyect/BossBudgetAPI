class PagoCreditoRepository {
    constructor(db, isMySQL = false) {
        this.db = db;
        this.isMySQL = isMySQL;
    }

    async create(pago) {
        const query = `
            INSERT INTO pagodecredito 
            (TipoDePago, idCreditos, AccionRealizada)
            VALUES (?, ?, ?)
        `;
        
        const values = [pago.TipoDePago, pago.idCreditos, pago.AccionRealizada];

        try {
            const result = await this.db.execute(query, values);
            return this.isMySQL ? result[0].insertId : result.lastID;
        } catch (error) {
            throw new Error(`Error al registrar pago: ${error.message}`);
        }
    }

    async findByCredito(idCreditos) {
        const query = 'SELECT * FROM pagodecredito WHERE idCreditos = ? ORDER BY idPagoDeCredito DESC';
        const [rows] = await this.db.execute(query, [idCreditos]);
        return rows;
    }

    async delete(id) {
        const query = 'DELETE FROM pagodecredito WHERE idPagoDeCredito = ?';
        await this.db.execute(query, [id]);
        return true;
    }
}

module.exports = PagoCreditoRepository;