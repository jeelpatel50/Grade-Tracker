const { query } = require('../db');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Assignment ID is required' });
    }

    try {
        // PUT - Update assignment
        if (req.method === 'PUT') {
            const { name, grade, weight, type, date } = req.body;

            const result = await query(
                `UPDATE assignments 
                 SET name = COALESCE($1, name),
                     grade = COALESCE($2, grade),
                     weight = COALESCE($3, weight),
                     type = COALESCE($4, type),
                     assignment_date = COALESCE($5, assignment_date)
                 WHERE id = $6
                 RETURNING *`,
                [name, grade, weight, type, date, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Assignment not found' });
            }

            return res.status(200).json({
                success: true,
                assignment: result.rows[0],
                message: 'Assignment updated successfully!'
            });
        }

        // DELETE - Delete assignment
        if (req.method === 'DELETE') {
            const result = await query(
                'DELETE FROM assignments WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Assignment not found' });
            }

            return res.status(200).json({
                success: true,
                message: 'Assignment deleted successfully!'
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Assignment API error:', error);
        res.status(500).json({ 
            error: 'Failed to process request. Please try again.' 
        });
    }
};
