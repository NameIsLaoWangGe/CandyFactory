import MainSceneControl from "./MainSceneControl";
import Candy from "./Candy";
import tools from "./Tool";
export default class OperationButton extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本组件*/
    private mainSceneControl;
    /**糖果父节点*/
    private candyParent: Laya.Sprite;
    /**克隆糖果用来移动的父节点*/
    private candyParent_Move: Laya.Sprite;
    /**操作开关*/
    private operationSwitch: boolean;
    /**敌人*/
    private enemy: Laya.Prefab;

    /**连续点击糖果正确而不犯错的事件*/
    private rightCount: number;
    /**点击次数记录*/
    private clicksCount: number;
    /**每点两次后的糖果颜色名称*/
    private clicksNameArr: Array<string>;
    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
        this.buttonClink();
    }

    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);
        this.candyParent = this.mainSceneControl.candyParent;
        this.candyParent_Move = this.mainSceneControl.candyParent_Move;
        this.operationSwitch = true;
        this.rightCount = 0;
        this.clicksCount = 0;
        this.clicksNameArr = [];
    }

    /**操作按钮的点击事件*/
    buttonClink(): void {
        for (let i = 0; i < this.self._children.length; i++) {
            this.self._children[i].on(Laya.Event.MOUSE_DOWN, this, this.down);
            this.self._children[i].on(Laya.Event.MOUSE_MOVE, this, this.move);
            this.self._children[i].on(Laya.Event.MOUSE_UP, this, this.up);
            this.self._children[i].on(Laya.Event.MOUSE_OUT, this, this.out);
        }
    }

    /**判断我按下的按钮和准备位置的糖果是否匹配;
     * 如果匹配，那么看下糖果上面写的几次点击次数，需要连续点击到这个次数才可以吃糖果
     * 如果次数没有达到，却点了另一种按钮，那么前面的次数会重置，并且出现一个怪物
     * 如果不匹配，说明点错了，糖果会跳到外面变成一个怪物,则出现一个怪物
     */
    down(event): void {
        this.clicksCount++;
        switch (event.currentTarget.name) {
            case 'redButton':
                this.clicksNameArr.push('redCandy___');
                break;
            case 'yellowButton':
                this.clicksNameArr.push('yellowCandy');
                break;
            case 'greenButton':
                this.clicksNameArr.push('greenCandy_');
                break;
            case 'blueButton':
                this.clicksNameArr.push('blueCandy__');
                break;
            default: break;
        }
        // 两两对比判断之后清空这个数组，当点击次数是2的倍数时进行对比
        if (this.clicksCount % 2 === 0 && this.clicksCount >= 2) {
            this.clickTwoCompareName();
            this.clicksNameArr = [];//对比后清空
        } else {

        }
        event.currentTarget.scale(0.9, 0.9);
    }

    /**点击一次的时候判断，如果这次点击和当前组糖果名称一个都不匹配那么这组直接变成敌人
     * 如果有一个一样，那么给这个糖果添加一个点对的标记
    */
    clickOneCompareName(): void {
        let nameGroup = [];
        for (let i = 0; i < this.candyParent._children.length; i++) {
            let candy = this.candyParent._children[i];
            if (candy["Candy"].group === (this.clicksCount - 1) / 2) {//每点两次对应的糖果组
                nameGroup.push(candy.name);
            }
        }
        // 对比
        for (let i = 0; i < nameGroup.length; i++) {
            if (nameGroup[i] === this.clicksNameArr[0]) {
            }
        }
    }

    /**点击两次之后对比名称
     * 点击次数和组数都是固定的，分别是10次和5组
     *所以点击了2次对应的就是第0组，4次就是第1组......
    */
    clickTwoCompareName(): void {
        let nameArr = [];
        let first_i: number;
        let i_02: number;
        for (let i = 0; i < this.candyParent._children.length; i++) {
            let candy = this.candyParent._children[i];
            if (candy["Candy"].group === (this.clicksCount - 2) / 2) {//每点两次对应的糖果组
                nameArr.push(candy.name);
                if (nameArr.length >= 2) {
                    nameArr[0] = nameArr[0].substring(0, 11);
                    nameArr[1] = nameArr[1].substring(0, 11);
                    // 对比两个数组看看是否相等，排序，转成字符串方可对比；
                    if (nameArr.sort().toString() === this.clicksNameArr.sort().toString()) {
                        console.log("点对了");
                        this.candyMove_Role(candy);
                        this.candyMove_Role(this.candyParent._children[first_i]);
                    } else {
                        console.log('点错了！');
                        this.candybecomeEnemy(candy);
                        this.candybecomeEnemy(this.candyParent._children[first_i]);
                    }
                } else if (nameArr.length === 1) {//循环到第一个的时候记录这个糖果的标签
                    first_i = i;
                }
            }
        }
    }

    /**糖果移动到主角规则*/
    candyMove_Role(candy: Laya.Sprite): void {
        // 第一个糖果移动
        if (candy.x < Laya.stage.width / 2) {
            candy["Candy"].candyTagRole = this.mainSceneControl.role_01;
        } else {
            candy["Candy"].candyTagRole = this.mainSceneControl.role_02;
        }
    }

    /**玩法1点击事件*/
    game1(event): void {
        if (!this.operationSwitch) {
            return;
        }
        if (this.candyParent._children.length > 0) {
            let candy = this.candyParent._children[0] as Laya.Sprite;
            let clicksLabel = candy.getChildByName('clicksLabel') as Laya.Label;
            // 名称切割
            candy.name = candy.name.substring(0, 11);
            let group = candy.name + event.currentTarget.name;
            let matching_01 = 'redCandy___' + 'redButton';
            let matching_02 = 'yellowCandy' + 'yellowButton';
            let matching_03 = 'greenCandy_' + 'greenButton';
            let matching_04 = 'blueCandy__' + 'blueButton';

            if (group === matching_01 || group === matching_02 || group === matching_03 || group === matching_04) {
                clicksLabel.text = (Number(clicksLabel.text) - 1).toString();
                // 消除重置点击次数
                if (Number(clicksLabel.text) === 0) {
                    this.rightCount += 1;
                    this.candyMove(candy);
                    candy.removeSelf();
                    this.createNewCandy();
                    for (let i = 0; i < this.candyParent._children.length; i++) {
                        // 下移一格
                        this.candyParent._children[i]['Candy'].moveAStep = true;
                    }
                }
            } else {
                this.rightCount = 0;
                this.candybecomeEnemy(candy);
                candy.removeSelf();
                this.createNewCandy();
                for (let i = 0; i < this.candyParent._children.length; i++) {
                    // 下移
                    this.candyParent._children[i]['Candy'].moveRules();
                }
            }
        }
    }

    /**在最后面重新生成一个糖果加入队列*/
    createNewCandy(): void {
        let candy = this.mainSceneControl.createCandy() as Laya.Sprite;
        // 这里this.candyParent._children.length - 2，因为已经删除一个了
        let y = this.candyParent._children[this.candyParent._children.length - 2].y;
        candy.y = y - (candy['Candy'].spaceY + candy.height);
        candy['Candy'].newCandy = true;
        candy['Candy'].timerControl = 20;
    }

    /**复制一个糖果到移动节点并移动
     *  @param candy 复制这个糖果
    */
    candyMove(candy: Laya.Sprite): void {
        for (let i = 0; i < 2; i++) {
            let copyCandy = this.copyTheCandy(candy);
            if (i === 0) {
                copyCandy['Candy'].candyTagRole = this.mainSceneControl.role_01;
            } else {
                copyCandy['Candy'].candyTagRole = this.mainSceneControl.role_02;
            }
        }
    }

    /**复制糖果
     *  @param candy 复制这个糖果
    */
    copyTheCandy(candy: Laya.Sprite): Laya.Sprite {
        let prefabCandy = this.mainSceneControl.candy;
        let copyCandy = Laya.Pool.getItemByCreateFun('candy', prefabCandy.create, prefabCandy) as Laya.Sprite;
        this.candyParent_Move.addChild(copyCandy);
        copyCandy.x = candy.x;
        copyCandy.y = candy.y;
        let candyName = candy.name.substring(0, 11);
        copyCandy.name = candyName;
        let url_01 = 'candy/黄色糖果.png';
        let url_02 = 'candy/红色糖果.png';
        let url_03 = 'candy/蓝色糖果.png';
        let url_04 = 'candy/绿色糖果.png';
        let pic = (copyCandy.getChildByName('pic') as Laya.Sprite);
        switch (candyName) {
            case 'yellowCandy':
                pic.loadImage(url_01);
                break;
            case 'redCandy___':
                pic.loadImage(url_02);
                break;
            case 'blueCandy__':
                pic.loadImage(url_03);
                break;
            case 'greenCandy_':
                pic.loadImage(url_04);
                break;
            default:
                break;
        }
        let clicksLabel = candy.getChildByName('clicksLabel') as Laya.Label;
        clicksLabel.text = '';
        return copyCandy;
    }

    /**点错后，糖果跳到地上变成1个敌人
     * 这个敌人是随机在一个范围内出生
     * @param candy 这个糖果的信息
    */
    candybecomeEnemy(candy: Laya.Sprite, ): void {
        // 左右两个方向
        let point;//固定圆心点
        let direction;//左右，用来判断位置和enemyTarget
        let enemyTarget;//攻击对象
        // 最终位置
        let moveX;
        let moveY;
        if (candy.x < Laya.stage.width / 2) {
            direction = 'left';
            enemyTarget = this.mainSceneControl.role_01;
            point = new Laya.Point(candy.x - 150, candy.y);
        } else {
            direction = 'right';
            enemyTarget = this.mainSceneControl.role_02;
            point = new Laya.Point(candy.x + 150, candy.y);
        }
        // 随机取点函数
        moveX = tools.getRoundPos(Math.random() * 360, Math.floor(Math.random() * 50), point).x;
        moveY = tools.getRoundPos(Math.random() * 360, Math.floor(Math.random() * 50), point).y;

        Laya.Tween.to(candy, { x: moveX, y: moveY }, 500, null, Laya.Handler.create(this, function () {
            // 触发主角预警并生成1个敌人
            this.selfScene['MainSceneControl'].role_01['Role'].role_Warning = true;
            this.selfScene['MainSceneControl'].role_02['Role'].role_Warning = true;
            let enemy = this.mainSceneControl.careatEnemy(direction, enemyTarget, 'range');
            enemy.pos(candy.x, candy.y);
            candy.removeSelf();
        }, []), 0);
    }

    //      /**点错后，糖果跳到地上变成2个敌人
    //      * 这两个敌人是随机出生地点
    //      * @param candy 复制这个糖果的信息
    //     */
    //    candybecomeEnemy_01(candy: Laya.Sprite, ): void {
    //     for (let i = 0; i < 2; i++) {
    //         let copyCandy = this.copyTheCandy(candy);
    //         // 左右两个方向
    //         let point;//固定圆心点
    //         let direction;//左右，用来判断位置和enemyTarget
    //         let enemyTarget;//攻击对象
    //         // 最终位置
    //         let moveX;
    //         let moveY;
    //         if (i === 0) {
    //             direction = 'left';
    //             enemyTarget = this.mainSceneControl.role_01;
    //             point = new Laya.Point(copyCandy.x - 250, copyCandy.y);
    //         } else {
    //             direction = 'right';
    //             enemyTarget = this.mainSceneControl.role_02;
    //             point = new Laya.Point(copyCandy.x + 250, copyCandy.y);
    //         }
    //         // 随机取点函数
    //         moveX = tools.getRoundPos(Math.random() * 360, Math.floor(Math.random() * 50), point).x;
    //         moveY = tools.getRoundPos(Math.random() * 360, Math.floor(Math.random() * 50), point).y;

    //         Laya.Tween.to(copyCandy, { x: moveX, y: moveY }, 500, null, Laya.Handler.create(this, function () {
    //             // 触发预警并生成2个敌人
    //             this.selfScene['MainSceneControl'].role_01['Role'].role_Warning = true;
    //             this.selfScene['MainSceneControl'].role_02['Role'].role_Warning = true;
    //             let enemy = this.mainSceneControl.careatEnemy(direction, enemyTarget, 'range');
    //             enemy.pos(copyCandy.x, copyCandy.y);
    //             copyCandy.removeSelf();
    //         }, []), 0);
    //     }
    // }


    /**移动*/
    move(event): void {
        if (!this.operationSwitch) {
            return;
        }
    }
    /**抬起*/
    up(event): void {
        if (!this.operationSwitch) {
            return;
        }
        event.currentTarget.scale(1, 1);
    }
    /**出屏幕*/
    out(event): void {
        if (!this.operationSwitch) {
            return;
        }
        event.currentTarget.scale(1, 1);
    }

    onUpdate(): void {
        // 主角全部死亡游戏结束
        if (this.mainSceneControl.roleParent._children.length === 0) {
            this.operationSwitch = false;
            return;
        }

        // 如果糖果被点完了，那么重新生成10个糖果
        if (this.candyParent._children.length === 0) {
            this.clicksCount = 0;
            this.mainSceneControl.createWaveCandys();
        }

        // 时间到了才可以进行操作
        if (this.mainSceneControl.timerControl > 200) {
            this.operationSwitch = true;
        }
    }

    onDisable(): void {
    }
}