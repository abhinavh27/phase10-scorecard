const STORAGE_KEY = 'phase10-scorecard-v1';
let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { round: 1, players: [] };

const list = document.querySelector('#player-list');
const emptyState = document.querySelector('#empty-state');
const dialog = document.querySelector('#player-dialog');
const form = document.querySelector('#player-form');
const nameField = document.querySelector('#player-name');
const template = document.querySelector('#player-row-template');

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function initials(name) { return name.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase(); }
function total(player) { return player.scores.reduce((sum, score) => sum + score, 0); }
function playerColor(index) { return ['#74cbb5', '#f5c653', '#f3a28f', '#a9b7ef', '#d8a6d4'][index % 5]; }

function renderSummary() {
  document.querySelector('#round-number').textContent = state.round;
  document.querySelector('#player-count').textContent = state.players.length;
  const leaderName = document.querySelector('#leader-name');
  const leaderDetail = document.querySelector('#leader-detail');
  if (!state.players.length) { leaderName.textContent = '—'; leaderDetail.textContent = 'Add players to begin'; return; }
  const leader = [...state.players].sort((a, b) => total(a) - total(b))[0];
  leaderName.textContent = leader.name;
  leaderDetail.textContent = `${total(leader)} total points`;
}

function render() {
  list.innerHTML = '';
  emptyState.hidden = state.players.length > 0;
  state.players.forEach((player, index) => {
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector('tr');
    const avatar = fragment.querySelector('.avatar');
    const nameInput = fragment.querySelector('.name-input');
    const phaseValue = fragment.querySelector('.phase-value');
    const scoreInput = fragment.querySelector('.score-input');
    avatar.textContent = initials(player.name); avatar.style.background = playerColor(index);
    nameInput.value = player.name; phaseValue.textContent = `Phase ${player.phase}`; scoreInput.value = player.scores.at(-1) ?? 0;
    fragment.querySelector('.total-score').textContent = total(player);
    nameInput.addEventListener('change', () => { player.name = nameInput.value.trim() || player.name; save(); render(); });
    scoreInput.addEventListener('input', () => {
      player.scores[player.scores.length - 1] = Math.max(0, Number(scoreInput.value) || 0);
      save();
      row.querySelector('.total-score').textContent = total(player);
      renderSummary();
    });
    fragment.querySelector('.phase-down').addEventListener('click', () => { player.phase = Math.max(1, player.phase - 1); save(); render(); });
    fragment.querySelector('.complete-phase-button').addEventListener('click', () => { player.phase = Math.min(10, player.phase + 1); save(); render(); });
    fragment.querySelector('.remove-button').addEventListener('click', () => { state.players.splice(index, 1); save(); render(); });
    list.append(row);
  });
  renderSummary();
}

function openDialog() { dialog.showModal(); setTimeout(() => nameField.focus(), 0); }
document.querySelector('#add-player').addEventListener('click', openDialog);
document.querySelector('#empty-add-player').addEventListener('click', openDialog);
form.addEventListener('submit', event => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const names = nameField.value.split(/[\n,]+/).map(name => name.trim()).filter(Boolean);
  if (!names.length) { nameField.focus(); return; }
  names.forEach(name => state.players.push({ id: crypto.randomUUID(), name: name.slice(0, 22), phase: 1, scores: Array(state.round).fill(0) }));
  save(); dialog.close(); form.reset(); render();
});
dialog.addEventListener('close', () => form.reset());
document.querySelector('#new-round').addEventListener('click', () => {
  state.round += 1;
  state.players.forEach(player => { player.scores.push(0); });
  save(); render();
});
document.querySelector('#reset-game').addEventListener('click', () => {
  if (!confirm('Reset this game? All players and scores will be removed.')) return;
  state = { round: 1, players: [] }; save(); render();
});
render();
