// import {describe, expect, test} from '@jest/globals';
import {
  GridSize,
  CellValue,
  gridCreate,
  gridGetCellValue,
  gridSetCellValue,
  centerCoordinates,
  coordinatesArrayContainsCoords,
  gridDescendingDiagonalIsWinning,
  gridAscendingDiagonalIsWinning,
  gridVerticalIsWinning,
  gridHorizontalIsWinning,
} from './Grid';

import * as _ from 'lodash';

describe('gridCreate', () => {
  test('initializes grid with correct dimensions and null values', () => {
    const grid = gridCreate(GridSize.THREE);
    expect(grid.length).toBe(GridSize.THREE);
    expect(grid[0].length).toBe(GridSize.THREE);
    expect(grid[0][0]).toBe(CellValue.NULL);
  });
});

describe('gridSetCellValue', () => {
  test('should set values', () => {
    const gridSize = GridSize.THREE
    const grid = gridCreate(gridSize);
    expect(gridGetCellValue(0, 0, grid, gridSize)).toBe(CellValue.NULL);
    gridSetCellValue(0, 0, grid, GridSize.THREE, CellValue.X);
    expect(gridGetCellValue(0, 0, grid, gridSize)).toBe(CellValue.X);
  });

  test('should raise error if coordinates beyond grid dimensions', () => {
    const grid = gridCreate(GridSize.THREE);
    const t = () => gridSetCellValue(3, 3, grid, GridSize.THREE, CellValue.X);
    expect(t).toThrow(TypeError);
  });
});

describe('centerCoordinates', ()=>{
  test('should return correct values for even sizes', ()=>{

    const r4 = [
      [1,1],[2,1],
      [1,2],[2,2]
    ]
    const r6 = [
      [2,2],[3,2],
      [2,3],[3,3]
    ]

    let cc = centerCoordinates(GridSize.FOUR);
    expect(
      cc.every(
        (c) => coordinatesArrayContainsCoords(r4, c[0], c[1])
      )
    ).toBe(true)
    
    cc = centerCoordinates(GridSize.SIX);
    expect(
      cc.every(
        (c) => coordinatesArrayContainsCoords(r6, c[0], c[1])
      )
    ).toBe(true)
  });  

  test('should return correct values for odd sizes', ()=>{
    const r3 = [
      [1,1],
    ]
    const r5 = [
      [2,2],
    ]
    
    expect(_.isEqual(r3, centerCoordinates(GridSize.THREE))).toBe(true)
    expect(_.isEqual(r5, centerCoordinates(GridSize.FIVE))).toBe(true)
  })
})

describe('gridDescendingDiagonalIsWinning', ()=>{
  test(
    'should return false if grid is not winning',
    ()=>{
      const gridSize = GridSize.THREE;
      const grid = gridCreate(gridSize);
      expect(
        gridDescendingDiagonalIsWinning(grid, gridSize)
      ).toBe(false)
    }
  )

  test(
    'should return true if grid is winning',
    ()=>{
      const gridSize = GridSize.THREE;
      const grid = gridCreate(gridSize);

      [
        ...Array(gridSize).keys()
      ]
      .forEach(
        (x)=> gridSetCellValue(x,gridSize-1-x, grid, gridSize, CellValue.X)
      )

      expect(
        gridDescendingDiagonalIsWinning(grid, gridSize)
      ).toBe(true)
    }
  )
})

describe('gridAscendingDiagonalIsWinning', ()=>{
  test(
    'should return false if grid is not winning',
    ()=>{
      const gridSize = GridSize.THREE;
      const grid = gridCreate(gridSize);
      expect(
        gridAscendingDiagonalIsWinning(grid, gridSize)
      ).toBe(false)
    }
  )
  test(
    'should return true if grid is winning',
    ()=>{
      const gridSize = GridSize.THREE;
      const grid = gridCreate(gridSize);

      [
        ...Array(gridSize).keys()
      ]
      .forEach(
        (x)=> gridSetCellValue(x,x, grid, gridSize, CellValue.X)
      )

      expect(
        gridAscendingDiagonalIsWinning(grid, gridSize)
      ).toBe(true)
    }
  )
})

describe('gridVerticalIsWinning', ()=>{
  test(
    'should return false if column of provided cell-value is not winning',
    ()=>{
      const gridSize = GridSize.THREE;
      const grid = gridCreate(gridSize);
      expect(
        gridVerticalIsWinning(0,0,grid,gridSize)
      ).toBe(false)
    }
  )

  test(
    'should return true if column of provided cell-value is winning',
    ()=>{
      const gridSize = GridSize.THREE
      const grid = gridCreate(gridSize);
      
      [
        ...Array(gridSize).keys()
      ]
      .forEach(
        (y)=>gridSetCellValue(0,y,grid,gridSize,CellValue.X)
      )

      expect(
        gridVerticalIsWinning(0,0,grid,gridSize)
      )
      .toBe(true)
    }
  )
})

describe('gridHorizontalIsWinning', ()=>{
  test(
    'should return false if horizontal of provided cell-value is not winning',
    ()=>{
      const gridSize = GridSize.THREE
      const grid = gridCreate(gridSize);
      expect(
        gridHorizontalIsWinning(0,0,grid,gridSize)
      ).toBe(false)
    }
  )

  test(
    'should return true if horizontal of provided cell-value is winning',
    ()=>{
      const gridSize = GridSize.THREE
      const grid = gridCreate(gridSize);
      [
        ...Array(gridSize).keys()
      ]
      .forEach(
        (x)=>gridSetCellValue(x,0,grid,gridSize,CellValue.X)
      )
      expect(
        gridHorizontalIsWinning(0,0,grid,gridSize)
      ).toBe(true)
    }
  )
})