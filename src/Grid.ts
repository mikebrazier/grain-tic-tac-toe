export enum CellValue {
  NULL = 0,
  X,
  O,
}

/**
 * Grids are addressed in `grid[x][y]` fashion
 * 
 * for visualation:
 * 
 * grid = [ [A,B,C], [E,F,G], [H,I,J] ]
 * 
 * y
 * 2 C G J
 * 1 B F I
 * 0 A E H
 *   0 1 2 x
 */

export type Grid = CellValue[][];

export enum GridSize {
  THREE = 3,
  FOUR,
  FIVE,
  SIX,
}

export function diagonalCoordinates(gridSize: GridSize) : number[][] {
  const r : number[][] = [];
  
  [
    ...Array(gridSize).keys()
  ]
  .forEach((x)=>{
    r.push([x, x]);
    r.push([x,gridSize-1-x])
  })

  return r
}

/**
 * Returns coordintates at center of grid through which diagonals cross.
 * For odd-size grids, this is one coordinate, and for even-size grids,
 * there are four coordinates 
 * 
 * @param gridSize size of grid
 * @returns array of singular coord for odd-size grids, array of coords for even-size grids
 */
export function centerCoordinates(gridSize: GridSize) : number[][] {
    if(gridSize % 2 ){
        return [ [Math.floor(gridSize/2), Math.floor(gridSize/2)] ]
    }
    else
    {
        const inc: number = gridSize/2 - 1;
        return [ 
            [0+inc, 0+inc], [1+inc, 0+inc],
            [0+inc, 1+inc], [1+inc, 1+inc],
        ]
    }
}

/**
 * return true if coordArray includes [x, y] 
 * @param coordArray array of coordinates in [x, y] format
 * @param x x of coordinate in question
 * @param y y of coordinate in question
 * @returns true if coordinate provided exists within coordArray
 */
export function coordinatesArrayContainsCoords(
        coordArray: number[][], 
        x: number, 
        y: number
    ) : boolean {
        return coordArray.some((coord)=>coord[0]==x&&coord[1]==y)
    } 

/**
 * prints grid to console
 * @param grid the grid to print
 * @param gridSize size of grid
 * @returns void
 */
export function gridPrint(grid: Grid, gridSize: GridSize) : void {

  // generate lines for console.log() one-at-a-time
  const lines : string[] = [];

  /**
   * for every y value, generate line in following format:
   * y    grid[0][y], grid[1][y], ... grid[gridSize-1][y]
   * y-1  grid[0][y], grid[1][y], ... grid[gridSize-1][y]
   * ...
   */
  [
    ...Array(gridSize).keys()
  ]
  .reverse()
  .forEach(
    (y)=>{
      let s = `${y}|`;
      [...Array(gridSize).keys()].forEach((x)=>s=s+grid[x][y]+' ')
      lines.push(s)
    }
  )

  // generate line for the x-axis
  // `  1 2 ... 3 x`
  let s = '  ';
  [
    ...Array(gridSize).keys()
  ]
  .forEach((x)=>s=s+`${x} `)
  lines.push(s+'x')

  // concat all lines
  let allLines = ''
  lines.forEach((l)=>allLines=allLines+l+' \n')

  // print
  console.log(allLines)
  
  return
}

/**
 * check if diagonal crossing from top-left to bottom-right corner of
 * grid is winning
 * @param grid grid
 * @param gridSize size of grid
 * @returns true if descending diagonal is winning
 */
export function gridDescendingDiagonalIsWinning(
  grid: Grid,
  gridSize: GridSize
) : boolean {
  if(
    // assert top-left corner cell contains non-null value
    gridGetCellValue(0, gridSize-1, grid, gridSize) != CellValue.NULL
    &&
    [
      ...Array(gridSize).keys()
    ]
    .reverse()
    // for x,y values of 0,gridSize-1 to 1,gridSize-2 to ... gridSize-1,0
    // assert cell values are equal to non-null value in top-left corner cell
    .every((y)=>gridGetCellValue((gridSize-y)-1,y,grid, gridSize)==gridGetCellValue(0, gridSize-1, grid, gridSize))
  )
  {
    return true
  }

  return false;
}

/**
 * check if diagonal crossing from bottom-left to top-right corner of
 * grid is winning
 * @param grid grid
 * @param gridSize size of grid
 * @returns true if ascending diagonal is winning
 */
export function gridAscendingDiagonalIsWinning(grid: Grid, gridSize: GridSize): boolean {
    // from 0,0 to gridSize-1,gridSize-1 assert all are uniform, non-null values
    if(
        gridGetCellValue(0,0,grid, gridSize) != CellValue.NULL
        &&
        [
            
            ...Array(gridSize).keys()
        ]
        // from 0,0 to 1,1 to 2,2
        .every(
            // each value equals the non-null value at 0,0
            (v)=>gridGetCellValue(v,v, grid, gridSize)==gridGetCellValue(0,0,grid, gridSize)
        )
      )
      {
        return true
      }
    
      return false;
}

/**
 * check if vertical from x,0 to x,gridSize-1 is winning
 * @param x x
 * @param y y
 * @param grid grid
 * @param gridSize gridSize
 * @returns true if column containing [x,y] is winning
 */
export function gridVerticalIsWinning(
  x: number,
  y: number,
  grid: Grid,
  gridSize: GridSize
) : boolean{
  if(
    // cell value at provided coords isn't null 
    gridGetCellValue(x,y,grid, gridSize) != CellValue.NULL
    &&
    // all cells of containing column equal cell value
    [
      ...Array(gridSize).keys()
    ]
    .every(
      (_y)=>gridGetCellValue(x,_y,grid, gridSize)==gridGetCellValue(x,y,grid, gridSize)
    )
  )
  {
      return true
  }
 
  return false;
}

/**
 * check if horizontal from 0,y to gridSize-1,y is winning
 * @param x x
 * @param y y
 * @param grid grid
 * @param gridSize gridSize
 * @returns true if row containing [x,y] is winning
 */
export function gridHorizontalIsWinning(
  x: number,
  y: number,
  grid: Grid,
  gridSize: GridSize
): boolean{
  if(
    gridGetCellValue(x,y,grid, gridSize) != CellValue.NULL
    &&
    [
      ...Array(gridSize).keys()
    ]
    .every(
      (_x)=>gridGetCellValue(_x,y, grid, gridSize)==gridGetCellValue(x,y,grid, gridSize)
    )
  )
  {
    return true
  }
  // from 0,y to gridSize-1,y assert all are uniform, non-null values
  return false;
}

/**
 * check if coordinate is winning.  a coordinate is considered winning
 * if it is within a vertical, horizontal, or diagonal line of length == gridSize
 * and uniform, non-null values
 * @param x x
 * @param y y
 * @param grid grid
 * @param gridSize size of grid
 * @returns true if coordinates are winning within grid
 */
export function gridCoordinatesAreWinning(
  x: number,
  y: number,
  grid: Grid,
  gridSize: GridSize
): boolean {
    // if coordinates are on diagonal, check diagonals
    if( 
        coordinatesArrayContainsCoords( diagonalCoordinates(gridSize), x, y )
    )
    {
        if(
            gridAscendingDiagonalIsWinning(grid, gridSize)
            ||
            gridDescendingDiagonalIsWinning(grid, gridSize)
        )
        {
            return true
        }
    }

  // check vertical and horizontal for wins
  if(
    gridVerticalIsWinning(x,y,grid,gridSize)
    ||
    gridHorizontalIsWinning(x,y,grid,gridSize)
  )
  {
    return true
  }

  return false;
}

/**
 * creates grid with null values
 * @param gridSize size of grid
 * @returns grid of provided gridSize
 */
export function gridCreate(gridSize: GridSize): Grid{
  return new Array(gridSize)
    .fill(CellValue.NULL)
    .map(() => new Array(gridSize).fill(CellValue.NULL));
}

/**
 * sets value of cell within grid at coordinates x,y
 * @param x x
 * @param y y
 * @param grid grid
 * @param gridSize size of grid
 * @param value CellValue
 * @returns void
 */
export function gridSetCellValue(
  x: number,
  y: number,
  grid: Grid,
  gridSize: GridSize,
  value: CellValue
): void {
  if (x >= gridSize || y >= gridSize) {
    throw new Error('coordinates beyond grid dimensions');
  }
  grid[x][y] = value;
  return
}

/**
 * gets value of cell within grid at coordinates x,y
 * @param x x
 * @param y y
 * @param grid grid
 * @returns value of cell
 */
export function gridGetCellValue(x: number, y: number, grid: Grid, gridSize: GridSize): CellValue {
  if (x >= gridSize || y >= gridSize) {
    throw new Error('coordinates beyond grid dimensions');
  }
  return grid[x][y];
}

/**
 * determines if all available spaces within Grid have been filled
 * @param grid grid
 * @returns true when all cell values are non-null
 */
export function gridFull(grid: Grid) : boolean{
  return grid.every((column)=>column.every((cell)=>cell!=CellValue.NULL))
}