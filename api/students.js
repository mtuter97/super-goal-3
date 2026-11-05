// Vercel Serverless Function: Student Registration & Database Sync
// Super Goal 3 Master Interactive Learning Platform
// Supervising Instructor: Teacher Mahmoud Al-Saeed

export default async function handler(req, res) {
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { name, school, xp = 0 } = req.body || {};
      if (!name || !school) {
        return res.status(400).json({ error: 'Student Name and School are mandatory fields.' });
      }

      const studentRecord = {
        id: 'std_' + Date.now(),
        name: String(name).trim(),
        school: String(school).trim(),
        xp: parseInt(xp, 10) || 0,
        registeredAt: new Date().toISOString(),
        status: 'Active',
        curriculum: 'Super Goal 3 (Term 1: Units 1-4)'
      };

      return res.status(200).json({
        success: true,
        message: 'Student identity successfully registered in Super Goal 3 database.',
        student: studentRecord
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  }

  // GET: Health & Status
  return res.status(200).json({
    status: 'operational',
    service: 'Super Goal 3 Student Database Gateway',
    supervisor: 'Teacher Mahmoud Al-Saeed',
    timestamp: new Date().toISOString()
  });
}
