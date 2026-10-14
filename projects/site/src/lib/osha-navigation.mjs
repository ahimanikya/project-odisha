// Editorial browsing categories preserve the evidence state of the saved row.
export function timingTokens(row) {
  const tokens=row.month_ids.map(id=>'month:'+id);
  if (['recurring','recurring_with_conflict'].includes(row.calendar_status)) tokens.push('recurring');
  if (['month_conflict','identity_conflict','recurring_with_conflict','unknown'].includes(row.calendar_status)) tokens.push('unresolved');
  if (row.calendar_status==='solar_transition') tokens.push('solar');
  return tokens;
}
export function timingLabel(row, months) {
  if (row.month_ids.length) return row.month_ids.map(id=>months.find(m=>m.id===id)?.label||id).join(' → ');
  return ({recurring:'Recurring observance',recurring_with_conflict:'Recurring · month account unresolved',month_conflict:'Month accounts differ',identity_conflict:'Identity needs clarification',unknown:'Odisha month unestablished',solar_transition:'Mithuna Sankranti · solar transition'})[row.calendar_status];
}
export function matchesNavigation(text, tokens, query='', timing='') {
  return (!query.trim()||text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))&&(!timing||tokens.includes(timing));
}
