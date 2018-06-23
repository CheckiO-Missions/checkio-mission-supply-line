//Dont change it
requirejs(['ext_editor_io', 'jquery_190', 'raphael_210'],
    function (extIO, $, TableComponent) {
        function supplyLineCanvas(dom, input, exp) {
            /*----------------------------------------------*
             *
             * attr
             *
             *----------------------------------------------*/
            const color = {
                orange_0: "#FABA00",
                orange_7: "#FA9900",
                orange_9: "#FA8F00",
                blue_0: "#8FC7ED",
                blue_1: "#7FBDE5",
            };

            const attr = {
                unit: {
                    enemy: {
                        'stroke': 'black',
                        'stroke-width': 0.3,
                        'fill': color.blue_1,
                    },
                    you: {
                        'stroke': 'gray',
                        'stroke-width': 0.3,
                        'fill': color.orange_7,
                    },
                    depot: {
                        'stroke': 'gray',
                        'stroke-width': 0.3,
                        'fill': color.orange_0,
                    },
                },
                supply_line: {
                    'stroke': color.orange_9,
                    'arrow-end': 'block-wide-long',
                    "stroke-width":"2.0px",
                },
                hex: {
                    'stroke-width': '0.3px',
                    'fill': '#dfe8f7',
                },
            };

            /*----------------------------------------*
             *
             * paper
             *
             *----------------------------------------*/
            const AU = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const paths = exp;
            const enemies = input[2];
            const you = input[0];
            const depots = input[1];
            const MAX_COL = 'L';

            const hexes = enemies.concat([you].concat(depots));
            let wk_col
                = hexes.map(x=>AU.indexOf(x[0])).sort((a, b)=>b-a)[0]+3;
            wk_col += wk_col % 2;

            const max_col = Math.min(wk_col, AU.indexOf(MAX_COL)+1);
            const paper = Raphael(dom, 
                (Math.ceil(max_col/2)*3+1)*18, 300, 0, 0);
            const delay = 200;

            /*----------------------------------------*
             *
             * func: hex
             *
             *----------------------------------------*/
            const hexagon = (paper, x0, y0, radius)=>{

                let path = "";

                for (let i = 0; i <= 6; i += 1) {
                    const a = i * 60;
                    const x = radius * Math.cos(a * Math.PI / 180);
                    const y = radius * Math.sin(a * Math.PI / 180);
                    path += (i == 0 ? "M": "L") + (x + x0) + "," + (y + y0);
                }
                path += "Z";

                return paper.path(path);
            };

            /*----------------------------------------*
             *
             * func: adjacent hexes
             *
             *----------------------------------------*/
            const adjacent_hexes = (hex, max_c)=>{

                const [c, r] = [hex.slice(0, 1), hex.slice(1)*1];
                const c_num = AU.indexOf(c);
                const t_r = r + c_num % 2 - 1;
                const b_r = r + c_num % 2;

                const adj_hexes = [hex];

                if (r-1 > 0)
                    adj_hexes.push(c+(r-1));

                if (r+1 < 10)
                    adj_hexes.push(c+(r+1));

                if (c_num+1 < max_c) {
                    if (t_r > 0)
                        adj_hexes.push(AU[c_num+1]+t_r);
                    if (b_r < 10)
                        adj_hexes.push(AU[c_num+1]+b_r);
                }

                if (c_num-1 >= 0) {
                    if (t_r > 0)
                        adj_hexes.push(AU[c_num-1]+t_r);
                    if (b_r < 10)
                        adj_hexes.push(AU[c_num-1]+b_r);
                }

                return adj_hexes;
            };

            /*----------------------------------------*
             *
             * func: supply line
             *
             *----------------------------------------*/
            const draw_supply_line = (coordinates, supply_path)=>{

                let num = 0;

                (function fn2(){
                    if (num === coordinates.length)
                        return;

                    const [x, y] = hex_dic[coordinates[num]].center; 
                    const path_ary = supply_path.attrs.path;
                    
                    supply_path.animate({'path': path_ary.join(',')
                        + ['L', x, y].join(' ')},
                        delay * 1, fn2);

                    num += 1;
                })();
            };

            /*----------------------------------------*
             *
             * func: draw_depot
             *
             *----------------------------------------*/
            const draw_depot = (paper, x, y)=>{
                const [sx, sy] = [x-3, y-11];
                const path = 'M' + [sx, sy].join(' ') +
                            'h' + (11) +
                            'v' + (22) +
                            'h' + (-16) + 
                            'v' + (-17) +
                            'Z';
                return paper.path(path).attr(attr.unit.depot);
            };

            /*----------------------------------------*
             *
             * func: draw_unit
             *
             *----------------------------------------*/
            const draw_unit = (paper, x, y, attr)=>{
                const [h, w, c] = [16, 20, 3];
                return paper.rect(x-(w/2), y-(h/2), w, h, c).attr(attr);
            };

            /*----------------------------------------*
             *
             * main
             *
             *----------------------------------------*/

            // draw hex-grid map
            const cellSize = 36;
            const hex_dic = {};
            for (let i = 0; i < 18; i += 1) {
                for (let j = 0; j < Math.ceil(max_col/2); j += 1) {
                    const cx = 1.5 * cellSize * j 
                        + cellSize / 2
                        + (i % 2 ? 3 * cellSize / 4 : 0);
                    const cy
                        = (i + 1) * cellSize * Math.sin(Math.PI / 3) / 2;
                    const hex_no = AU[j*2+i%2]+(Math.floor(i/2)+1);
                    hex_dic[hex_no] = {
                        center: [cx, cy],
                        hex: hexagon(paper,cx,cy,cellSize/2).attr(attr.hex)
                    };
                }
            }

            // supply_line
            const [sx, sy] = hex_dic[you].center;
            const p =
                paper.path(['M', sx, sy].join(',')).attr(attr.supply_line);

            // depot
            depots.forEach(d=>{
                const [dx, dy] = hex_dic[d].center;
                draw_depot(paper, dx, dy);
            });

            // enemy
            enemies.forEach(e=>{
                const [ex, ey] = hex_dic[e].center;
                draw_unit(paper, ex, ey, attr.unit.enemy);
                adjacent_hexes(e, max_col).forEach(a=>{
                    hex_dic[a].hex.animate(
                        {'fill': color.blue_0},
                        delay * 4
                    );
                });
            });

            // you
            const [yx, yy] = hex_dic[you].center;
            draw_unit(paper, yx, yy, attr.unit.you);

            //hex_num text
            for (let a=0; a < max_col; a += 1) {
                for (let n=1; n <= 9; n += 1) {
                    const hex_id = AU[a] + n;
                    const [cx, cy] = hex_dic[hex_id].center;
                    paper.text(cx, cy, hex_id).attr(attr.text);
                }
            }

            // start draw supply_line
            if (paths) {
                setTimeout(function() {
                    draw_supply_line(paths.slice(1), p);
                }, delay * 6);
            }
        }

        let $tryit;
        let io = new extIO({
            multipleArguments: true,
            functions: {
                js: 'supplyLine',
                python: 'supply_line'
            },
            animation: function($expl, data){
                supplyLineCanvas(
                    $expl[0],
                    data.in,
                   data.ext.explanation
                );
            }
        });
        io.start();
    }
);
