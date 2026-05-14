class TipoCreditoRepository {
    constructor(db, isMySQL = false) {
        this.db = db;
        this.isMySQL = isMySQL;
    }

    async findAll() {
        const query = 'SELECT * FROM tipodecredito ORDER BY idTipoDeCredito';
        const [rows] = await this.db.execute(query);
        return rows;
    }

    async findById(id) {
        const query = 'SELECT * FROM tipodecredito WHERE idTipoDeCredito = ?';
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    async create(tipoCredito) {
        const query = 'INSERT INTO tipodecredito (idTipoDeCredito, TipoDeCredito) VALUES (?, ?)';
        const values = [tipoCredito.idTipoDeCredito, tipoCredito.TipoDeCredito];
        
        try {
            await this.db.execute(query, values);
            return tipoCredito.idTipoDeCredito;
        } catch (error) {
            throw new Error(`Error al crear tipo de crédito: ${error.message}`);
        }
    }

    async update(id, tipoCredito) {
        const query = 'UPDATE tipodecredito SET TipoDeCredito = ? WHERE idTipoDeCredito = ?';
        await this.db.execute(query, [tipoCredito.TipoDeCredito, id]);
        return this.findById(id);
    }

    async delete(id) {
        // Verificar si hay créditos usando este tipo
        const checkQuery = 'SELECT COUNT(*) as count FROM creditos WHERE idTipoDeCredito = ?';
        const [rows] = await this.db.execute(checkQuery, [id]);
        
        if (rows[0].count > 0) {
            throw new Error('No se puede eliminar el tipo de crédito porque tiene créditos asociados');
        }
        
        const query = 'DELETE FROM tipodecredito WHERE idTipoDeCredito = ?';
        await this.db.execute(query, [id]);
        return true;
    }
}

module.exports = TipoCreditoRepository;