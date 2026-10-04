const KEY = 'phase10-scorecard-ios-v1';
let state = JSON.parse(localStorage.getItem(KEY)) || { round: 1, players: [] };
const colors = ['#74cbb5', '#f5c653', '#f3a28f', '#a9b7ef', '#d8a6d4'];
const $ = selector => document.querySelector(selector);
const total = player => player.scores.reduce((sum, score) => sum + score, 0);
const initials = name => name.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase();
const save = () => localStorage.setItem(KEY, JSON.stringify(state));

function renderSummary() {
  $('#round').textContent = state.round;
  const leader = state.players.length && [...state.players].sort((a, b) => total(a) - total(b))[0];
  $('#leader').textContent = leader ? leader.name : '—';
  $('#leader-detail').textContent = leader ? `${total(leader)} points` : 'Add players to begin';
}

function render() {
  const list = $('#player-list');
  list.innerHTML = '';
  $('#empty').hidden = Boolean(state.players.length);
  state.players.forEach((player, index) => {
    const card = document.createElement('article');
    card.className = 'player-card';
    card.innerHTML = `
      <div class="player-top"><span class="avatar" style="background:${colors[index % colors.length]}">${initials(player.name)}</span><input class="name" aria-label="Player name" maxlength="22" value="${escapeHtml(player.name)}"><button class="remove" aria-label="Remove ${escapeHtml(player.name)}">×</button></div>
      <div class="player-data"><div><span>PHASE</span><strong>${player.phase}</strong></div><div><span>THIS ROUND</span><input class="score" type="number" inputmode="numeric" min="0" max="999" value="${player.scores.at(-1) || 0}" aria-label="${escapeHtml(player.name)} score this round"></div><div><span>TOTAL</span><strong>${total(player)}</strong></div></div>
      <div class="actions"><button class="previous" ${player.phase === 1 ? 'disabled' : ''}>− Phase</button><button class="complete" ${player.phase === 10 ? 'disabled' : ''}>Complete phase ${player.phase === 10 ? '✓' : '+'}</button></div>`;
    card.querySelector('.name').addEventListener('change', event => { player.name = event.target.value.trim() || player.name; save(); render(); });
    card.querySelector('.score').addEventListener('input', event => { player.scores[player.scores.length - 1] = Math.max(0, Number(event.target.value) || 0); save(); renderSummary(); card.querySelector('.player-data strong:last-child').textContent = total(player); });
    card.querySelector('.previous').addEventListener('click', () => { player.phase = Math.max(1, player.phase - 1); save(); render(); });
    card.querySelector('.complete').addEventListener('click', () => { player.phase = Math.min(10, player.phase + 1); save(); render(); });
    card.querySelector('.remove').addEventListener('click', () => { state.players.splice(index, 1); save(); render(); });
    list.append(card);
  });
  renderSummary();
}

function escapeHtml(value) { const element = document.createElement('span'); element.textContent = value; return element.innerHTML; }
function openDialog() { $('#player-dialog').showModal(); setTimeout(() => $('#names').focus(), 0); }
$('#add-player').addEventListener('click', openDialog);
$('.open-add').addEventListener('click', openDialog);
$('.close').addEventListener('click', () => $('#player-dialog').close());
$('#player-form').addEventListener('submit', event => {
  event.preventDefault();
  const names = $('#names').value.split(/[\n,]+/).map(name => name.trim()).filter(Boolean);
  if (!names.length) return $('#names').focus();
  names.forEach(name => state.players.push({ name: name.slice(0, 22), phase: 1, scores: Array(state.round).fill(0) }));
  save(); event.target.reset(); $('#player-dialog').close(); render();
});
$('#new-round').addEventListener('click', () => { state.round += 1; state.players.forEach(player => player.scores.push(0)); save(); render(); });
$('#reset').addEventListener('click', () => { if (confirm('Reset this game? All players and scores will be removed.')) { state = { round: 1, players: [] }; save(); render(); } });
render();
