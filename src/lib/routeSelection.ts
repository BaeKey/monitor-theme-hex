export type RouteSelection = number[] | 'all'
export function readRouteSelection(value:string|null):RouteSelection {
  if(value===null)return 'all'
  if(value==='all')return 'all'
  const ids=[...new Set(value.split(',').map(Number).filter(id=>Number.isSafeInteger(id)&&id>0))];return ids.length?ids:'all'
}
export function selectedRouteIds(selection:RouteSelection,available:number[]):number[] {
  return selection==='all'?available:selection
}
