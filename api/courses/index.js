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
        // GET - List all courses for a user
        if (req.method === 'GET') {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const result = await query(
                `SELECT c.*, 
                        COALESCE(
                            (SELECT json_agg(
                                json_build_object(
                                    'id', a.id,
                                    'name', a.name,
                                    'grade', a.grade,
                                    'weight', a.weight,
                                    'type', a.type,
                                    'assignmentDate', a.assignment_date,
                                    'createdAt', a.created_at
                                )
                            )
                            FROM assignments a 
                            WHERE a.course_id = c.id
                            ORDER BY a.assignment_date DESC), '[]'::json
                        ) as assignments
                 FROM courses c
                 WHERE c.user_id = $1
                 ORDER BY c.created_at DESC`,
                [userId]
            );

            return res.status(200).json({
                success: true,
                courses: result.rows
            });
        }

        // POST - Create new course
        if (req.method === 'POST') {
            const { userId, name, code, targetGrade, color } = req.body;

            // Validate input
            if (!userId || !name || !code) {
                return res.status(400).json({ 
                    error: 'User ID, course name, and course code are required' 
                });
            }

            if (targetGrade && (targetGrade < 0 || targetGrade > 100)) {
                return res.status(400).json({ 
                    error: 'Target grade must be between 0 and 100' 
                });
            }

            const result = await query(
                `INSERT INTO courses (user_id, name, code, target_grade, color, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                 RETURNING *`,
                [userId, name, code, targetGrade || 85, color || 'blue']
            );

            return res.status(201).json({
                success: true,
                course: result.rows[0],
                message: 'Course created successfully!'
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Courses API error:', error);
        
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(400).json({ 
                error: 'A course with this code already exists' 
            });
        }

        res.status(500).json({ 
            error: 'Failed to process request. Please try again.' 
        });
    }
};
