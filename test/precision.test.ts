import { expect } from "@jest/globals"
import { toPrecision } from "./utils/Number"

test('should provide the right precision',()=>{

    expect(toPrecision(1000.12345,4)).toBe('1000.1234')
    
})
test('should provide the right precision',()=>{

    
    expect(toPrecision(1000,4)).toBe('1000.0000')

})

test('should provide the right precision',()=>{

    
    expect(toPrecision(544.2,4)).toBe('544.2000')

})

test('should provide the right precision',()=>{

    
    expect(toPrecision(0.28787,2)).toBe('0.28')


})

test('should provide the right precision',()=>{

    
    expect(toPrecision(45.287987998787,6)).toBe('45.287987')


})

test('should provide the right precision',()=>{

    
    expect(toPrecision(287987998787,6)).toBe('287987998787.000000')


})


test('should provide the right precision',()=>{

    
    expect(toPrecision(287987998787.333,6)).toBe('287987998787.333000')


})

test('should provide the right precision',()=>{

    
    expect(toPrecision(0,6)).toBe('0.000000')


})