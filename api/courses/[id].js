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
        return res.status(400).json({ error: 'Course ID is required' });
    }

    try {
        // PUT - Update course
        if (req.method === 'PUT') {
            const { name, code, targetGrade, color } = req.body;

            const result = await query(
                `UPDATE courses 
                 SET name = COALESCE($1, name),
                     code = COALESCE($2, code),
                     target_grade = COALESCE($3, target_grade),
                     color = COALESCE($4, color),
                     updated_at = NOW()
                 WHERE id = $5
                 RETURNING *`,
                [name, code, targetGrade, color, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Course not found' });
            }

            return res.status(200).json({
                success: true,
                course: result.rows[0],
                message: 'Course updated successfully!'
            });
        }

        // DELETE - Delete course
        if (req.method === 'DELETE') {
            const result = await query(
                'DELETE FROM courses WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Course not found' });
            }

            return res.status(200).json({
                success: true,
                message: 'Course deleted successfully!'
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Course API error:', error);
        res.status(500).json({ 
            error: 'Failed to process request. Please try again.' 
        });
    }
};
