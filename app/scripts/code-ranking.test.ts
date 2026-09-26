import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCodeSort, sortCodeRows } from '../src/lib/code-ranking';

const rows = [
 {name:'Alpha',stars:10,forks:1,watchers:2,commits90d:20,failed:false},
 {name:'Beta',stars:5,forks:3,watchers:4,commits90d:10,failed:false},
 {name:'Missing',stars:null,forks:null,watchers:null,commits90d:99,failed:true},
 {name:'Zero',stars:0,forks:0,watchers:0,commits90d:0,failed:false},
];
test('each CODE sort uses its own metric and keeps missing values below zero',()=>{
 assert.deepEqual(sortCodeRows(rows,'stars').map(r=>r.name),['Alpha','Beta','Zero','Missing']);
 assert.deepEqual(sortCodeRows(rows,'forks').map(r=>r.name),['Beta','Alpha','Zero','Missing']);
 assert.deepEqual(sortCodeRows(rows,'watchers').map(r=>r.name),['Beta','Alpha','Zero','Missing']);
 assert.deepEqual(sortCodeRows(rows,'commits').map(r=>r.name),['Alpha','Beta','Zero','Missing']);
 assert.deepEqual(rows.map(r=>r.name),['Alpha','Beta','Missing','Zero']);
});
test('ties stay deterministic and existing sort URLs retain their meaning',()=>{
 assert.equal(parseCodeSort('watchers'),'watchers');
 assert.equal(parseCodeSort('garbage'),'stars');
 assert.equal(parseCodeSort(null),'stars');
 const tied=[{...rows[0],name:'Zulu'},{...rows[0],name:'Alpha'}];
 assert.deepEqual(sortCodeRows(tied,'stars').map(r=>r.name),['Alpha','Zulu']);
});
