var Loose = function(){

}
Loose.prototype = {};

(function(){

var id = 1;
Loose.GridElt = function(next, id, mx, my, hx, hy){
  this.id = id;
  this.mx = mx;
  this.my = my;
  this.hx = hx;
  this.hy = hy;
  this.next = next;
}
})();

Loose.Query = function(a,b,c,d){
  this.center = [a,b,c,d]
};

Loose.GridLooseCell = function(head){
    this.rect = [0,0,0,0]
    this.head = head === void 0 ? -1 : head;
};
Loose.GridLoose = function(){
  this.cells = [new Loose.GridLooseCell()];
  this.cells[0].rect = [0,0,400,400]
  this.num_cols = 1;
  this.num_rows = 1;
  this.inv_cell_w = 0;
  this.inv_cell_h = 0;
}
Loose.GridTightCell = function(next,cell){
  this.next = next;
  this.lcell = cell;
}
Loose.GridTight = function(){
  this.cells = [];
  this.head = null;
  this.num_cols = 1;
  this.num_rows = 1;
  this.num_cells = 0;
  this.inv_cell_h = 0;
  this.inv_cell_w = 0;
}
Loose.Grid = function(){
  this.tight = new Loose.GridTight();
  this.loose = new Loose.GridLoose();
  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.h = 0;
  this.elts = [];
  this.num_elts = 0;
}
Loose.Grid.prototype = {
  first_free: -1,
  erase: function(n){
    
    this.elts[n].next = this.first_free;//.splice(elt_idx, 1);
    this.first_free = n;
  },
  insert: function(element){
    if (this.first_free !== -1)
    {
      var index = this.first_free;
      this.first_free = this.elts[this.first_free].next;
      this.elts[index] = element;
      return index;
    }else{
      return this.elts.push(element) - 1;
    }
  }
};
var ceil_div = function(value, divisor){
  // Returns the value divided by the divisor rounded up.
  return Math.ceil(value / divisor);
}
var min_int = function(a, b){
  a -= b;
  a &= a >> 31;
  return a + b;
}
var min_flt = function(a, b){
  return Math.min(a, b);
}
var max_flt = function(a, b){
  return Math.max(a, b);
}
var to_cell_idx = function(val, inv_cell_size, num_cells){
  var cell_pos = Math.floor(val * inv_cell_size);
  return Math.min(Math.max(cell_pos, 0), num_cells - 1);
}
var mul4f = function(a,b){
    return [
      a[0]*b[0],
      a[1]*b[1],
      a[2]*b[2],
      a[3]*b[3]
    ];
}
var clamp4i = function(val, min, max){
    return [
      Math.floor(Math.min(Math.max(val[0], min[0]), max[0])),
      Math.floor(Math.min(Math.max(val[1], min[1]), max[1])),
      Math.floor(Math.min(Math.max(val[2], min[2]), max[2])),
      Math.floor(Math.min(Math.max(val[3], min[3]), max[3])),
    ];
}, simd_clamp4i = clamp4i;
var to_tcell_idx4 = function(grid, rect){
  var inv_cell_size_vec = [grid.tight.inv_cell_w, grid.tight.inv_cell_h,
  grid.tight.inv_cell_w, grid.tight.inv_cell_h];

  var cell_xyf_vec = mul4f(rect, inv_cell_size_vec);
  var clamp_vec = [grid.tight.num_cols-1, grid.tight.num_rows-1,
    grid.tight.num_cols-1, grid.tight.num_rows-1];
  var cell_xy_vec = clamp4i(cell_xyf_vec, [0,0,0,0], clamp_vec);
  return cell_xy_vec;
}
var grid_optimize = function(grid){
  var new_elts = new Loose.Element();
  new_elts.reserve(grid.num_elts);

  for (var c=0; c < grid.loose.num_cells; ++c){
    // Replace links to the old elements list to links in the new
    // cache-friendly element list.
    var new_elt_idxs = [];
    var lcell = new Loose.GridLooseCell(grid.loose.cells[c]);

    while(lcell.head !== -1)
    {
      var elt = grid.elts[lcell.head];
      new_elt_idxs.push(new_elts.push(elt)-1);
      lcell.head = elt.next;
    }
    for (var j=0; j < new_elt_idxs.length; ++j)
    {
      var new_elt_idx = new_elt_idxs[j];
      new_elts[new_elt_idx].next = lcell.head;
      lcell.head = new_elt_idx;
    }
  }
  //// Swap the new element list with the old one.
  grid.elts = new_elts;
}


var expand_aabb = function(/*LGrid*/ grid, cell_idx, mx, my, hx, hy){
  //LGridLooseCell
  var lcell = grid.loose.cells[cell_idx];
  var prev_rect = [lcell.rect[0], lcell.rect[1], lcell.rect[2], lcell.rect[3]];
  lcell.rect[0] = min_flt(lcell.rect[0], mx - hx);
  lcell.rect[1] = min_flt(lcell.rect[1], my - hy);
  lcell.rect[2] = max_flt(lcell.rect[2], mx + hx);
  lcell.rect[3] = max_flt(lcell.rect[3], my + hy);

  // Determine the cells occupied by the loose cell in the tight grid.
  var elt_rect = [mx-hx, my-hy, mx+hx, my+hy];
  var trect = to_tcell_idx4(grid, elt_rect);

  if (prev_rect[0] > prev_rect[2]){
    // If the loose cell was empty, simply insert the loose cell
    // to all the tight cells it occupies. We don't need to check
    // to see if it was already inserted.
    for (var ty = trect[1]; ty <= trect[3]; ++ty){
      var tight_row = grid.tight.heads[ty*grid.tight.num_cols];
      for (var tx = trect[0]; tx <= trect[2]; ++tx){

        var /*LGridTightCell*/ new_tcell = new Loose.GridTightCell(grid.tight.heads[ty*grid.tight.num_cols+tx], cell_idx);
        grid.tight.heads[ty*grid.tight.num_cols+tx] = grid.tight.cells.push(new_tcell)-1;
      }
    }
  }else{
    // Only perform the insertion if the loose cell overlaps new tight cells.
    var prev_trect = to_tcell_idx4(grid, prev_rect);
    if (trect[0] !== prev_trect[0] || trect[1] !== prev_trect[1] ||
      trect[2] !== prev_trect[2] || trect[3] !== prev_trect[3]){
      for (var ty = trect[1]; ty <= trect[3]; ++ty){
        var tight_row = grid.tight.heads[ty*grid.tight.num_cols];
        for (var tx = trect[0]; tx <= trect[2]; ++tx){
          if (tx < prev_trect[0] || tx > prev_trect[2] ||
            ty < prev_trect[1] || ty > prev_trect[3]){
            var /*LGridTightCell*/ new_tcell = new Loose.GridTightCell(grid.tight.heads[ty*grid.tight.num_cols+tx], cell_idx);
            grid.tight.heads[ty*grid.tight.num_cols+tx] = grid.tight.cells.push(new_tcell)-1;
          }
        }
      }
    }
  }
};

var element_rect = function(/* LGridElt**/ elt){
  return [elt.mx-elt.hx, elt.my-elt.hy,
  elt.mx+elt.hx, elt.my+elt.hy];
}

/*LGrid*/ 
var lgrid_create = function(lcell_w, lcell_h, tcell_w, tcell_h,
  l, t, r, b){
  var  w = r - l, h = b - t;
  var num_lcols = ceil_div(w, lcell_w), num_lrows = ceil_div(h, lcell_h);
  var num_tcols = ceil_div(w, tcell_w), num_trows = ceil_div(h, tcell_h);

  var /*LGrid*/ grid = new Loose.Grid();
  grid.num_elts = 0;
  grid.x = l;
  grid.y = t;
  grid.h = w;
  grid.w = h;

  grid.loose.num_cols = num_lcols;
  grid.loose.num_rows = num_lrows;
  grid.loose.num_cells = grid.loose.num_cols * grid.loose.num_rows;
  grid.loose.inv_cell_w = 1 / lcell_w;
  grid.loose.inv_cell_h = 1 / lcell_h;

  grid.tight.num_cols = num_tcols;
  grid.tight.num_rows = num_trows;
  grid.tight.num_cells = grid.tight.num_cols * grid.tight.num_rows;
  grid.tight.inv_cell_w = 1 / tcell_w;
  grid.tight.inv_cell_h = 1 / tcell_h;

  // Initialize tight cell heads with -1 to indicate empty indexed SLLs.
  grid.tight.heads = [grid.tight.num_cells];
  for (var j=0; j < grid.tight.num_cells; ++j){
    grid.tight.heads[j] = -1;
  }

  // Initialize all the loose cells.
  for (var c=0; c < grid.loose.num_cells; ++c){
    grid.loose.cells[c] = new Loose.GridLooseCell();
    grid.loose.cells[c].head = -1;
    grid.loose.cells[c].rect[0] = Infinity;
    grid.loose.cells[c].rect[1] = Infinity;
    grid.loose.cells[c].rect[2] = -Infinity;
    grid.loose.cells[c].rect[3] = -Infinity;
  }
  return grid;
}

var lgrid_destroy = function(/*LGrid*/ grid){
  delete grid.loose.cells;
  delete grid.tight.heads;
  delete grid;
}

var lgrid_lcell_idx = function(/*LGrid*/ grid, x, y){
  var cell_x = to_cell_idx(x - grid.x, grid.loose.inv_cell_w, grid.loose.num_cols);
  var cell_y = to_cell_idx(y - grid.y, grid.loose.inv_cell_h, grid.loose.num_rows);
  return cell_y * grid.loose.num_cols + cell_x;
}

var lgrid_insert = function(/*LGrid*/ grid, id, mx, my, hx, hy){
  var cell_idx = lgrid_lcell_idx(grid, mx, my);
  /*LGridLooseCell*/
  var lcell = grid.loose.cells[cell_idx];

  // Insert the element to the appropriate loose cell and row.
  var /*LGridElt*/ new_elt = new Loose.GridElt(lcell.head, id, mx - grid.x, my - grid.y, hx, hy);
  lcell.head = grid.insert(new_elt);
  ++grid.num_elts;

  // Expand the loose cell's bounding box to fit the new element.
  expand_aabb(grid, cell_idx, mx, my, hx, hy);
}


var lgrid_remove = function(/*LGrid*/ grid, id, mx, my){
  var unwrap = function(head, out = []){
    if(head === -1)
      return out;
    out.push(grid.elts[head].id);
    return unwrap(l.elts[head].next, out)

  };

  // Find the element in the loose cell.
  /*LGridLooseCell*/
  var lcell = grid.loose.cells[lgrid_lcell_idx(grid, mx, my)];
  var link = lcell.head;
  var prev = -1;

  //console.log(unwrap(link))

  while (grid.elts[link].id !== id) {
    prev = link
    link = grid.elts[ link ].next;
  }

  // Remove the element from the loose cell and row.
  var elt_idx = link;
  var el = grid.elts[elt_idx];
  /*if(prev === -1)
    lcell.head = grid.elts[elt_idx].next;*/
  grid.erase(elt_idx);
  
  --grid.num_elts;
  return el;
}

var lgrid_move = function(/*LGrid*/ grid, id, prev_mx, prev_my, mx, my){
  var prev_cell_idx = lgrid_lcell_idx(grid, prev_mx, prev_my);
  var new_cell_idx = lgrid_lcell_idx(grid, mx, my);
  /*LGridLooseCell*/
  var lcell = grid.loose.cells[prev_cell_idx];

  if (prev_cell_idx === new_cell_idx){
    // Find the element in the loose cell.
    var elt_idx = lcell.head;
    while(grid.elts[elt_idx].id !== id)
      elt_idx = grid.elts[elt_idx].next;
    /*if(elt_idx !== id)
      debugger*/
    elt_idx = id;

    // Since the element is still inside the same cell, we can simply overwrite 
    // its position and expand the loose cell's AABB.
    mx -= grid.x;
    my -= grid.y;
    grid.elts[elt_idx].mx = mx;
    grid.elts[elt_idx].my = my;
    expand_aabb(grid, prev_cell_idx, mx, my, grid.elts[elt_idx].hx, grid.elts[elt_idx].hy);
  }else{
    var r = lgrid_remove(grid, id, prev_mx, prev_my);
    /*
    // Find the element in the loose cell.
    var link = lcell.head;
    while (grid.elts[link].id !== id)
      link = grid.elts[link].next;

    var elt_idx = link;
    var  hx = grid.elts[elt_idx].hx;
    var  hy = grid.elts[elt_idx].hy;

    // If the element has moved into a different loose cell, remove
    // remove the element from the previous loose cell and row.
    //var link = grid.elts[elt_idx].next;
    elt_idx = grid.elts[elt_idx].next;
    grid.erase(elt_idx);
    
    --grid.num_elts;*/

    // Now insert the element to its new position.
    lgrid_insert(grid, id, mx, my, r.hx, r.hy);
  }
}
var simd_rect_intersect4f = function(a,b) {
  //x1 y1 x2 y2
  // left top right bottom
  return a[ 2 ] >= b[ 0 ] && a[ 0 ] <= b[ 2 ] && a[ 1 ] <= b[ 3 ] && a[ 3 ] >= b[ 1 ];
  //return a[ 0 ] < b[ 2 ] && a[ 2 ] > b[ 0 ] && a[ 1 ] > b[ 3 ] && a[ 3 ] < b[ 1 ];
}
/*SmallList<int> */
var lgrid_query = function(/*LGrid*/ grid, mx, my, hx, hy, omit_id){
  mx -= grid.x;
  my -= grid.y;

  // Compute the tight cell extents [min_tx, min_ty, max_tx, max_ty].
  var qrect = [mx-hx, my-hy, mx+hx, my+hy];
  var qrect_vec = qrect;
  var trect = to_tcell_idx4(grid, qrect_vec);

  // Gather the intersecting loose cells in the tight cells that intersect.
  /*SmallList<int> lcell_idxs;*/
  var lcell_idxs = [];
  for (var ty = trect[1]; ty <= trect[3]; ++ty)
  {
    var tight_row = grid.tight.heads[ty*grid.tight.num_cols];
    for (var tx = trect[0]; tx <= trect[2]; ++tx)
    {
      // Iterate through the loose cells that intersect the tight cells.
      var tcell_idx =  grid.tight.heads[ty*grid.tight.num_cols+tx];
      while (tcell_idx !== -1)
      {
        var /*LGridTightCell*/ tcell = grid.tight.cells[tcell_idx];
        var /*LGridLooseCell*/ lcell = grid.loose.cells[tcell.lcell];
        if (lcell_idxs.indexOf(tcell.lcell) === -1 &&
          simd_rect_intersect4f(qrect_vec, [lcell.rect]))
          lcell_idxs.push(tcell.lcell);
        tcell_idx = tcell.next;
      }
    }
  }

  // For each loose cell, determine what elements intersect.
  /*SmallList<int> res;*/
  var res = [];
  for (var j=0; j < lcell_idxs.length; ++j)
  {
    var lcell = grid.loose.cells[lcell_idxs[j]];
    var elt_idx = lcell.head;
    while (elt_idx !== -1){
      // If the element intersects the search rectangle, add it to the
      // resulting elements unless it has an ID that should be omitted.
      var elt = grid.elts[elt_idx];
      if (elt.id !== omit_id && simd_rect_intersect4f(qrect_vec, element_rect(elt)))
        res.push(elt.id);
      elt_idx = elt.next;
    }
  }
  return res;
}

var simd_sub4f = function(a,b){
    return [
      a[0]-b[0],
      a[1]-b[1],
      a[2]-b[2],
      a[3]-b[3]
    ];
}
var simd_add4f = function(a,b){
  return [
    a[0]+b[0],
    a[1]+b[1],
    a[2]+b[2],
    a[3]+b[3]
  ];
};
var simd_mul4f = function(a,b){
  return [
    a[0]*b[0],
    a[1]*b[1],
    a[2]*b[2],
    a[3]*b[3]
  ];
};
var simd_zero4i = function(){
    return [0,0,0,0];
}
var simd_ftoi4f = function(a){
    return [
      Math.floor(a[0]),
      Math.floor(a[1]),
      Math.floor(a[2]),
      Math.floor(a[3])
    ]
}
var simd_scalar4f = function(a){
    return [a,a,a,a];//?[a,0,0,0]?
}
var simd_scalar4i = function(a){
  return [a,a,a,a];//?[a,0,0,0]?
}

/*LGridQuery4*/
//var lgrid_query4 = function(const LGrid* grid, mx4, my4,
//hx4, hy4, const SimdVec4i* omit_id4)
var lgrid_query4 = function(/*LGrid*/ grid, mx4, my4, hx4, hy4, omit_id4)
{
  var hx_vec = [hx4,hx4,hx4,hx4], hy_vec = [hy4,hy4,hy4,hy4];
  var mx_vec = simd_sub4f([mx4, mx4, mx4, mx4], simd_scalar4f(grid.x));
  var my_vec = simd_sub4f([my4,my4,my4,my4], simd_scalar4f(grid.y));
  var ql_vec = simd_sub4f(mx_vec, hx_vec), qt_vec = simd_sub4f(my_vec, hy_vec);
  var qr_vec = simd_add4f(mx_vec, hx_vec), qb_vec = simd_add4f(my_vec, hy_vec);

  var inv_cell_w_vec = simd_scalar4f(grid.tight.inv_cell_w), inv_cell_h_vec = simd_scalar4f(grid.tight.inv_cell_h);
  var max_x_vec = simd_scalar4i(grid.tight.num_cols-1), max_y_vec = simd_scalar4i(grid.tight.num_rows-1);
  var tmin_x_vec = simd_clamp4i(simd_ftoi4f(simd_mul4f(ql_vec, inv_cell_w_vec)), simd_zero4i(), max_x_vec);
  var tmin_y_vec = simd_clamp4i(simd_ftoi4f(simd_mul4f(qt_vec, inv_cell_h_vec)), simd_zero4i(), max_y_vec);
  var tmax_x_vec = simd_clamp4i(simd_ftoi4f(simd_mul4f(qr_vec, inv_cell_w_vec)), simd_zero4i(), max_x_vec);
  var tmax_y_vec = simd_clamp4i(simd_ftoi4f(simd_mul4f(qb_vec, inv_cell_h_vec)), simd_zero4i(), max_y_vec);

  var tmin_x4 = (tmin_x_vec), tmin_y4 = (tmin_y_vec);
  var tmax_x4 = (tmax_x_vec), tmax_y4 = (tmax_y_vec);
  var ql4 = (ql_vec), qt4 = (qt_vec);
  var qr4 = (qr_vec), qb4 = (qb_vec);

  var res4 = [];//new Loose.Query();
  //LGridQuery4 res4;
  for (var k=0; k < 1; ++k){
    var trect = [tmin_x4[k], tmin_y4[k], tmax_x4[k], tmax_y4[k]];
    //var omit_id = omit_id4[k];

/*    if(trect[0] > trect[2]){
      [trect[0], trect[2]] = [trect[2], trect[0]];
    }
    if(trect[1] > trect[3]){
      [trect[1], trect[3]] = [trect[3], trect[1]];
    }*/

    // Gather the intersecting loose cells in the tight cells that intersect.
    //SmallList<int> lcell_idxs;
    var lcell_idxs = [];
    var qrect_vec = [ql4[k], qt4[k], qr4[k], qb4[k]];



    for (var ty = trect[1]; ty <= trect[3]; ++ty){
      //const int* tight_row = grid.tight.heads + ty*grid.tight.num_cols;
      var tight_row = grid.tight.heads[ty*grid.tight.num_cols]

      for (var tx = trect[0]; tx <= trect[2]; ++tx)
      {

        // Iterate through the loose cells that intersect the tight cells.
        var tcell_idx = grid.tight.heads[ty*grid.tight.num_cols+tx];//tight_row[tx];

        while (tcell_idx !== -1)
        {
          var /*LGridTightCell**/ tcell = grid.tight.cells[tcell_idx];
          //console.log(tcell_idx, qrect_vec, lcell_idxs.indexOf(tcell.lcell))

          if (lcell_idxs.indexOf(tcell.lcell) === -1 && simd_rect_intersect4f(qrect_vec, (grid.loose.cells[tcell.lcell].rect)))
            lcell_idxs.push(tcell.lcell);
          tcell_idx = tcell.next;
        }
      }
    }

    // For each loose cell, determine what elements intersect.
    for (var j=0; j < lcell_idxs.length && res4.length < 40; ++j)
    {
      var lcell = grid.loose.cells[lcell_idxs[j]];
      var elt_idx = lcell.head;
      while (elt_idx !== -1)
      {
        // If the element intersects the search rectangle, add it to the
        // resulting elements unless it has an ID that should be omitted.
        var /*LGridElt**/ elt = grid.elts[elt_idx];
        if (/*elt.id !== omit_id && */simd_rect_intersect4f(qrect_vec, element_rect(elt)))
          res4.push(elt.id);
        elt_idx = elt.next;
      }
    }
  }
  return res4;
}

var lgrid_in_bounds = function(/*LGrid*/ grid,  mx,  my,  hx,  hy){
  mx -= grid.x;
  my -= grid.y;
  const  x1 = mx-hx, y1 = my-hy, x2 = mx+hx, y2 = my+hy;
  return x1 >= 0.0 && x2 < grid.w && y1 >= 0.0 && y2 < grid.h;
}

var grid_optimize= function(grid){
  var new_elts = [];

  for (var c=0; c < grid.loose.num_cells; ++c){
    // Replace links to the old elements list to links in the new
    // cache-friendly element list.
    var new_elt_idxs = [];
    var lcell = grid.loose.cells[c];
    while (lcell.head !== -1){
      var elt = grid.elts[lcell.head];
      new_elt_idxs.push(new_elts.push(elt)-1);
      lcell.head = elt.next;
    }
    for (var j=0; j < new_elt_idxs.length; ++j)
    {
      var new_elt_idx = new_elt_idxs[j];
      new_elts[new_elt_idx].next = lcell.head;
      lcell.head = new_elt_idx;
    }
  }
  // Swap the new element list with the old one.
  grid.elts = new_elts;
}

/*
var lgrid_optimize = function(/!*LGrid*!/ grid)
{
  // Clear all the tight cell data.
  for (var j=0; j < grid.tight.num_cells; ++j) {
    grid.tight.heads[ j ] = -1;
  }
  grid.tight.cells.clear();

  // Optimize the memory layout of the grid.
  grid_optimize(grid);

  //#pragma omp parallel for
  for (var c=0; c < grid.loose.num_cells; ++c)
  {
    // Empty the loose cell's bounding box.
    var lcell = grid.loose.cells[c];
    lcell.rect[0] = Infinity;
    lcell.rect[1] = Infinity;
    lcell.rect[2] = -Infinity;
    lcell.rect[3] = -Infinity;

    // Expand the bounding box by each element's extents in 
    // the loose cell.
    var elt_idx = lcell.head;
    while (elt_idx !== -1)
    {
      var elt = grid.elts[elt_idx];
      lcell.rect[0] = min_flt(lcell.rect[0], elt.mx - elt.hx);
      lcell.rect[1] = min_flt(lcell.rect[1], elt.my - elt.hy);
      lcell.rect[2] = max_flt(lcell.rect[2], elt.mx + elt.hx);
      lcell.rect[3] = max_flt(lcell.rect[3], elt.my + elt.hy);
      lcell.head = elt_idx = elt.next;
    }
  }

  for (var c=0; c < grid.loose.num_cells; ++c)
  {
    // Insert the loose cell to all the tight cells in which 
    // it now belongs.
    var lcell = grid.loose.cells[c];
    var trect = to_tcell_idx4(grid, lcell.rect);
    for (var ty = trect[1]; ty <= trect[3]; ++ty){
      var tight_row = grid.tight.heads[ty*grid.tight.num_cols];
      for (var tx = trect[0]; tx <= trect[2]; ++tx){
        var /!*LGridTightCell*!/ new_tcell = new Loose.GridTightCell(tight_row[tx], c);
        grid.tight.heads[ty*grid.tight.num_cols+tx] = grid.tight.cells.push(new_tcell);
      }
    }
  }
}*/
