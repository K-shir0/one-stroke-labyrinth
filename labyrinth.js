const WALL = 1;
const PATH = 0;
const DEBUG = true;
let c = 0;
const cc = 3;

let text = "この文章は、迷路のようになっていて、少し読み辛いかもしれません。もしこの文章が読めたなら、あなたには迷路の才能があると思います。ここまで来たらあと少しです。通らなかった文字を上から読んで下さい。";
let answer = "めいろ";
oneStrokeLabyrinthChar(text, answer);

function oneStrokeLabyrinthChar(text, answer) {
    let array = oneStroke();

    let strArray = new Array(10);
    for (let i = 0; i < strArray.length; i++) {
        strArray[i] = new Array(strArray.length);
    }
    let strX = 0;
    let strY = 0;

    let eX = 0;
    let eY = 0;
    let eVector = 1;
    let reVector = (eVector + 2) % 4; //ベクトルの逆
    let tmp;
    let tmp2;
    let discover = [];

    let cun = 0;
    for (let i = 0, sX = 0, sY = 0, cnt = 0; eVector !== -1; i++) {
        reVector = (eVector + 2) % 4;
        tmp = aroundRoute(array, eX, eY, reVector); //周りの経路を探索

        eVector = tmp.findIndex(value => value === 0); //ベクトルの定義

        strArray[strX][strY] = text.charAt(cun);
        cun++;

        tmp = coordinateIncrement(strX, strY, eVector, 1);
        strX = tmp[0]; strY = tmp[1];

        tmp = coordinateIncrement(eX, eY, eVector); //進む
        eX = tmp[0];
        eY = tmp[1];

        /*
        * ここから可能なところを探索
        * */
        tmp = aroundRoute(array, eX, eY);
        tmp2 = aroundRoute(array, sX, sY);

        //壁を発見して配列に入れて 抽選して　←終わってない 突き当たりまで調べる 無理なら抽選　で道を広げる　ループ

        if (eVector !== -1) { //最後除外
            for (let j = 0; j < 4; j++) {
                if (tmp[j] === WALL && tmp[j] === tmp2[j]) {
                    discover[cnt] = [eX, eY, sX, sY, j]; //最後ベクトル
                    cnt++;
                }
            }
        }
    }
    showAry(array);
    showAry(strArray, answer);
}


function oneStroke() {
    /*
    * 開始 配列の作成＆初期化
    * */


    let array = new Array(19);

    for (let i = 0; i < array.length; i++) {
        array[i] = new Array(array.length);
        if (i % 2 === 1) {
            array[i].fill(WALL);
        } else {
            for (let j = 0; j < array.length; j++) {
                if (j % 2 === 1) {
                    array[i][j] = WALL;
                } else {
                    array[i][j] = PATH;
                }
            }
        }
    }
    /*
    * 終了 配列の作成＆初期化
    * */

    /*
    * 開始 スタート＆ゴール＆初期値の指定
    * */
    let x = 0, y = 0;

    for (;x < array.length - 1; x++) {
        if (array[x][y] === WALL) {
            array[x][y] = PATH;
        }
    }

    for (;y < array.length - 1; y++) {
        if (array[x][y] === WALL) {
            array[x][y] = PATH;
        }
    }

    // for (;x > 10; x--) {
    //     if (array[x][y] === wall) {
    //         array[x][y] = path;
    //     }
    // }
    x = array.length - 1;
    y = 2;
    let vector = 2;
    /*
    * 終了 スタート＆ゴール＆初期値の指定
    * */



    let exFlag = false;
    let tmp = new Array(1);
    let cun = 0;
    let forward = [];
    let tmp2;
    let skipFlag = false;
    while (tmp.length !== 0 && exFlag === false) {
        tmp = koSearch(array, x, y, vector);

        let zeroFlag = false;
        //抽選フェイズ
        cun = 0;

        //ゼロが見つかったら再抽選
        while (zeroFlag === false && tmp.length > 0) {

            let rdmNum = selectRdm(tmp.length, 0);
            let eX = tmp[rdmNum][0], eY = tmp[rdmNum][1], sX = tmp[rdmNum][2], sY = tmp[rdmNum][3],
                sVector = tmp[rdmNum][4];
            forward = [eX, eY, sX, sY, sVector];

            tmp2 = coordinateIncrement(eX, eY, sVector);
            eX = tmp2[0]; eY = tmp2[1];

            tmp2 = coordinateIncrement(sX, sY, sVector);
            sX = tmp2[0]; sY = tmp2[1];

            //行けるところを探索フェイズ
            exFlag = false;
            while (exFlag === false) {

                // console.log(
                // aroundRoute(array, eX, eY)[3]);
                if (aroundRoute(array, eX, eY).every(value => value === 1) && aroundRoute(array, sX, sY).every(value => value === 1)) {
                    if (aroundRoute(array, sX, sY)[sVector] !== void 0 && aroundRoute(array, eX, eY)[sVector] !== void 0) {
                        tmp2 = coordinateIncrement(eX, eY, sVector);
                        eX = tmp2[0]; eY = tmp2[1];

                        tmp2 = coordinateIncrement(sX, sY, sVector);
                        sX = tmp2[0]; sY = tmp2[1];
                    } else {
                        exFlag = true;
                    }
                    cun++;
                } else {
                    exFlag = true;
                }
            }
            //ゼロ経路が見つかった！！
            if (cun !== 0) {
                zeroFlag = true;
            } else {
                if (tmp.length > 0) {
                    tmp.splice(rdmNum, 1);
                } else {
                    skipFlag = true;
                }
            }
        }

        exFlag = false;

        if (tmp.length > 0) {

            let distance = Math.floor(Math.random() * (cun - 1 + 1 - 1) + 1);
            //(distance - 1)のとき、distanceに補正する
            if (distance === cun - 1) {
                distance = cun;
            }

            //進むフェイズ

            tmp = coordinateIncrement(forward[0], forward[1], (forward[4] + 5) % 4, 1);
            array[tmp[0]][tmp[1]] = 1;
            for (let i = 0; i < distance * 2; i++) {
                tmp = coordinateIncrement(forward[0], forward[1], forward[4], 1);
                forward[0] = tmp[0]; forward[1] = tmp[1];
                array[forward[0]][forward[1]] = 0;

                tmp2 = coordinateIncrement(forward[2], forward[3], forward[4], 1);
                forward[2] = tmp2[0]; forward[3] = tmp2[1];
                array[forward[2]][forward[3]] = 0;
            }
            tmp = coordinateIncrement(forward[0], forward[1], (forward[4] + 5) % 4, 1);
            array[tmp[0]][tmp[1]] = 0;

            showAry(array)
        }
    }

    return array;
}


/***
 * コの字を延ばせるところを探す
 * @param array
 * @param x
 * @param y
 * @param vector
 * @returns {[]}
 */
function koSearch(array, x, y, vector) {
    let eX = x;
    let eY = y;
    let eVector = vector;
    let reVector = (eVector + 2) % 4; //ベクトルの逆
    let tmp;
    let tmp2;
    let discover = [];

    for (let i = 0, sX = 0, sY = 0, cnt = 0; eVector !== -1; i++) {
        sX = eX; //探索用2
        sY = eY;
        reVector = (eVector + 2) % 4;
        tmp = aroundRoute(array, eX, eY, reVector); //周りの経路を探索

        eVector = tmp.findIndex(value => value === 0); //ベクトルの定義

        tmp = coordinateIncrement(eX, eY, eVector); //進む
        eX = tmp[0];
        eY = tmp[1];

        /*
        * ここから可能なところを探索
        * */
        tmp = aroundRoute(array, eX, eY);
        tmp2 = aroundRoute(array, sX, sY);

        //壁を発見して配列に入れて 抽選して　←終わってない 突き当たりまで調べる 無理なら抽選　で道を広げる　ループ

        if (eVector !== -1) { //最後除外
            for (let j = 0; j < 4; j++) {
                if (tmp[j] === WALL && tmp[j] === tmp2[j]) {
                    discover[cnt] = [eX, eY, sX, sY, j]; //最後ベクトル
                    cnt++;
                }
            }
        }
    }
    return discover

}

//周りのルートの数を配列で返す。
function aroundRoute(array, x, y, reVector) {
    let around = new Array(4);
    if (x !== 0 && reVector !== 3) {
        //上の時
        around[3] = array[x - 1][y];
    }
    if (x !== array.length - 1 && reVector !== 1) {
        around[1] = array[x + 1][y];
    }
    if (y !== 0 && reVector !== 0) {
        around[0] = array[x][y - 1];
    }
    if (y !== array.length - 1 && reVector !== 2) {
        around[2] = array[x][y + 1];
    }
    return around;
}


/***
 * 引数を入力すると、ベクトルに応じた方向に距離分進み、その座標を返す。
 * @param x
 * @param y
 * @param vector
 * @param distance
 * @returns {[*, *]}
 */
function coordinateIncrement(x, y, vector, distance) {
    if (distance === void 0) {
        //距離が指定されていない場合

        let num = [x, y, ]; //x, y, 初期値

        if (vector === 0) {
            num[2] = y;
            num[1] -= 2;
        } else if (vector === 1) {
            num[2] = x;
            num[0] += 2;
        } else if (vector === 2) {
            num[2] = y;
            num[1] += 2;
        } else if (vector === 3) {
            num[2] = x;
            num[0] -= 2;
        }
        return num

    } else {
        //距離が指定された場合

        let num = [x, y, ]; //x, y, 初期値
        if (vector === 0) {
            num[2] = y;
            num[1] -= distance;
        } else if (vector === 1) {
            num[2] = x;
            num[0] += distance;
        } else if (vector === 2) {
            num[2] = y;
            num[1] += distance;
        } else if (vector === 3) {
            num[2] = x;
            num[0] -= distance;
        }
        return num

    }
}


/***
 * showAry関数
 * 配列を並べて表示します。
 * @param array
 * @param answer
 * @returns {number}
 */
function showAry(array, answer) {
    const wall = "壁";
    const passage = "・";
    let str = "";
    let wallCount = 0; //八方塞がりを数える

    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length; j++) {
            str2 = array[j][i];
            if (str2 === void 0) {
                str += answer.charAt(wallCount);
                wallCount++;
            } else if (str2 === 0) {
                str += passage;
            } else if (str2 === 1) {
                str += wall;
            } else {
                str += str2;
            }

        }
        str += "<br>\n"
    }

    if (wallCount > 0) {
        if (wallCount === 3) {
            showAryString.innerHTML = str;
        } else {
            oneStrokeLabyrinthChar(text, answer)
        }

        console.log(wallCount);

    } else {
        showAryStr.innerHTML = str;
        console.log(str);
    }
    return wallCount;

}


/***
 * selectRdm関数
 * maxからminの中から一つ数字を選ぶ
 * @param max
 * @param min
 * @returns {number} ランダムな数
 */
function selectRdm(max, min) {
    return Math.floor(Math.random() * (max - min) + min);
}