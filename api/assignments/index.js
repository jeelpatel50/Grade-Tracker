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

    try {
        // GET - List assignments for a course
        if (req.method === 'GET') {
            const { courseId } = req.query;

            if (!courseId) {
                return res.status(400).json({ error: 'Course ID is required' });
            }

            const result = await query(
                'SELECT * FROM assignments WHERE course_id = $1 ORDER BY assignment_date DESC',
                [courseId]
            );

            return res.status(200).json({
                success: true,
                assignments: result.rows
            });
        }

        // POST - Create new assignment
        if (req.method === 'POST') {
            const { courseId, name, grade, weight, type, date } = req.body;

            // Validate input
            if (!courseId || !name || grade === undefined || weight === undefined) {
                return res.status(400).json({ 
                    error: 'Course ID, name, grade, and weight are required' 
                });
            }

            if (grade < 0 || grade > 100 || weight < 0 || weight > 100) {
                return res.status(400).json({ 
                    error: 'Grade and weight must be between 0 and 100' 
                });
            }

            // Check total weight
            const totalWeightResult = await query(
                'SELECT COALESCE(SUM(weight), 0) as total FROM assignments WHERE course_id = $1',
                [courseId]
            );

            const currentTotal = parseFloat(totalWeightResult.rows[0].total);

            if (currentTotal + parseFloat(weight) > 100) {
                return res.status(400).json({ 
                    error: `Total weight cannot exceed 100%. Current total: ${currentTotal}%` 
                });
            }

            const result = await query(
                `INSERT INTO assignments (course_id, name, grade, weight, type, assignment_date, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())
                 RETURNING *`,
                [courseId, name, grade, weight, type || 'Assignment', date || new Date().toISOString().split('T')[0]]
            );

            return res.status(201).json({
                success: true,
                assignment: result.rows[0],
                message: 'Assignment added successfully!'
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Assignments API error:', error);
        res.status(500).json({ 
            error: 'Failed to process request. Please try again.' 
        });
    }
};
