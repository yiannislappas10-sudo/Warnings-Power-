// Holds a /warn action while it waits for the moderator to click
// Confirm or Cancel. Lost on restart - if that happens mid-confirmation,
// the moderator just runs /warn again. Not worth persisting to disk.
const pending = new Map();

function createPending(data) {
  const token = Math.random().toString(36).slice(2, 10);
  pending.set(token, { ...data, createdAt: Date.now() });
  return token;
}

function getPending(token) {
  return pending.get(token);
}

function deletePending(token) {
  pending.delete(token);
}

module.exports = { createPending, getPending, deletePending };
