// repositories/pagoCreditoRepository.js
class PagoCreditoRepository {
    constructor(db, isMySQL = false) {
        this.db = db;
        this.isMySQL = isMySQL;
    }

    async create(pago) {
        const query = `
            INSERT INTO pagodecredito 
            (TipoDePago, idCreditos, Monto, AccionRealizada, FechaPago)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const values = [
            pago.TipoDePago,
            pago.idCreditos,
            pago.Monto,  // ← Asegurar que es Monto
            pago.AccionRealizada,
            pago.FechaPago || new Date().toISOString().split('T')[0]
        ];
        
        console.log('📝 Insertando pago:', values);
        
        const result = await this.db.execute(query, values);
        return this.isMySQL ? result[0].insertId : result.lastID;
    }

    async findByCredito(idCreditos) {
        const query = 'SELECT * FROM pagodecredito WHERE idCreditos = ? ORDER BY FechaPago DESC';
        const [rows] = await this.db.execute(query, [idCreditos]);
        return rows;
    }
}

module.exports = PagoCreditoRepository;