//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            var checkioInput = data.in;

            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').remove();
            }

            var canvas = new FindSequenceCanvas();
            canvas.createCanvas($content.find(".explanation")[0], checkioInput, explanation);

            this_e.setAnimationHeight($content.height() + 60);

        });

       

        var colorOrange4 = "#F0801A";
        var colorOrange3 = "#FA8F00";
        var colorOrange2 = "#FAA600";
        var colorOrange1 = "#FABA00";

        var colorBlue4 = "#294270";
        var colorBlue3 = "#006CA9";
        var colorBlue2 = "#65A1CF";
        var colorBlue1 = "#8FC7ED";

        var colorGrey4 = "#737370";
        var colorGrey3 = "#9D9E9E";
        var colorGrey2 = "#C5C6C6";
        var colorGrey1 = "#EBEDED";

        var colorWhite = "#FFFFFF";

        function FindSequenceCanvas() {
            var zx = 20;
            var zy = 20;
            var cellSize = 30;
            var cellN
            var fullSize;

            var colorDark = "#294270";
            var colorOrange = "#F0801A";
            var colorBlue = "#6BA3CF";
            var colorLightBlue = "#69B3E3";
            var colorWhite = "#FFFFFF";

            var attrRect = {"stroke": colorDark, "stroke-width": 2, "fill": colorWhite, "fill-opacity": 0};
            var attrText = {"font-family": "Verdana", "font-size": 24, "stroke": colorDark};
            var attrTextMark = {"font-family": "Verdana", "font-size": 24, "stroke": colorOrange, "fill": colorOrange};

            var paper;
            var rectSet;
            var numberSet;
            var matrix = [];
            var maxN = 6;

            this.createCanvas = function(dom, dataInput, explInput) {
                cellN = dataInput.length;
                fullSize = zx * 2 + cellN * cellSize;
                paper = Raphael(dom, fullSize, fullSize, 0, 0);
                rectSet = paper.set();
                numberSet = paper.set();
                for (var i = 0; i < dataInput.length; i++) {
                    var row = [];
                    for (var j = 0; j < dataInput[0].length; j++) {
                        row.push(dataInput[i][j]);
                        numberSet.push(
                            paper.text(j * cellSize + cellSize / 2 + zx,
                                i * cellSize + cellSize / 2 + zx,
                                dataInput[i][j]
                            ).attr(attrText)
                        );
                        var r = paper.rect(j * cellSize + zx,
                            i * cellSize + zx,
                            cellSize, cellSize
                        ).attr(attrRect);
                        r.mark = i * cellN + j;
                        rectSet.push(r);
                    }
                    matrix.push(row);
                }
                for (i = 0; i < explInput.length; i++) {
                    numberSet[explInput[i][0] * cellN + explInput[i][1]].attr(attrTextMark);
                }

            };

            this.createFeedback = function(N) {
                maxN = N;
                rectSet.click(
                    function(e) {
                        var mark = this.mark;
                        var number = parseInt(numberSet[mark].attr("text"));
                        number = (number == maxN - 1) ? maxN : ((number + 1) % maxN);
                        numberSet[mark].attr("text", String(number));
                        matrix[Math.floor(mark / cellN)][mark % cellN] = number;

                    }
                );
            };

            this.shuffle = function() {
                for (var i = 0; i < matrix.length; i++) {
                    for (var j = 0; j < matrix[0].length; j++) {
                        matrix[i][j] = Math.floor(Math.random() * maxN) + 1;
                        numberSet[i * cellN + j].attr("text", String(matrix[i][j]));
                    }
                }
            };

            this.getMatrix = function() {
                return matrix;
            };
        }


    }
);
