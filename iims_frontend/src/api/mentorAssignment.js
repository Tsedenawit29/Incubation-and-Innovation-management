const API_URL = "http://localhost:8081/api";

export async function assignMentor(token, startupId, mentorId) {
  const res = await fetch(`${API_URL}/mentor-assignment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ startupId, mentorId }),
  });
  if (!res.ok) throw new Error('Failed to assign mentor');
  return res.json();
}

export async function getMentorsForStartup(token, startupId) {
  const res = await fetch(`${API_URL}/mentor-assignment?startupId=${startupId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch mentors for startup');
  return res.json();
}

export async function unassignMentor(token, startupId, mentorId) {
    const res = await fetch(`${API_URL}/mentor-assignment?startupId=${startupId}&mentorId=${mentorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to unassign mentor');
  }

export async function getStartupsForMentor(token, mentorId) {
  const res = await fetch(`${API_URL}/mentor-assignment?mentorId=${mentorId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch startups for mentor');
  return res.json();
} 