import MainSceneControl from "./MainSceneControl";
import Candy from "./Candy";
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

    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
    }

    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);
        this.candyParent = this.mainSceneControl.candyParent;
        this.candyParent_Move = this.mainSceneControl.candyParent_Move;
        this.operationSwitch = false;

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
        // this.candyParent._children[5]['Candy'].moveAStep = true;
        // console.log(this.candyParent);
        if (this.candyParent._children.length > 0) {
            let candy = this.candyParent._children[0] as Laya.Sprite;
            let clicksLabel = candy.getChildByName('clicksLabel') as Laya.Label;

            let candyName = candy.name.substring(0, 11);
            let group = candyName + event.currentTarget.name;
            let matching_01 = 'redCandy___' + 'redButton';
            let matching_02 = 'yellowCandy' + 'yellowButton';
            let matching_03 = 'greenCandy_' + 'greenButton';
            let matching_04 = 'blueCandy__' + 'blueButton';

            if (group === matching_01 || group === matching_02 || group === matching_03 || group === matching_04) {
                clicksLabel.text = (Number(clicksLabel.text) - 1).toString();
                // 消除重置点击次数
                if (Number(clicksLabel.text) === 0) {
                    this.candyMove(candy);
                    candy.removeSelf();
                    this.createNewCandy();
                    for (let i = 0; i < this.candyParent._children.length; i++) {
                        // 下移一格
                        this.candyParent._children[i]['Candy'].moveAStep = true;
                    }
                }
            } else {
                this.candybecomeEnemy(candy);
                candy.removeSelf();
                this.createNewCandy();
                for (let i = 0; i < this.candyParent._children.length; i++) {
                    // 下移
                    this.candyParent._children[i]['Candy'].moveRules();
                }
            }
        }
        event.currentTarget.scale(0.9, 0.9);
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

    /**点错后，糖果跳到地上变成2个敌人
     * @param candy 复制这个糖果的信息
    */
    candybecomeEnemy(candy: Laya.Sprite): void {
        for (let i = 0; i < 2; i++) {
            let copyCandy = this.copyTheCandy(candy);
            // 左右两个方向
            let destination;
            let direction;
            let enemyTarget;
            if (i === 0) {
                destination = -250;
                direction = 'left';
                enemyTarget = this.mainSceneControl.role_01;
            } else {
                destination = 250;
                direction = 'right';
                enemyTarget = this.mainSceneControl.role_02;
            }
            Laya.Tween.to(copyCandy, { x: copyCandy.x + destination, }, 500, null, Laya.Handler.create(this, function () {

                let enemy = this.mainSceneControl.careatEnemy(direction, enemyTarget, 'range');
                enemy.pos(copyCandy.x, copyCandy.y);
                copyCandy.removeSelf();
            }, []), 0);
        }
    }

    /**移动*/
    move(event): void {
    }
    /**抬起*/
    up(event): void {
        event.currentTarget.scale(1, 1);
    }
    /**出屏幕*/
    out(event): void {
        event.currentTarget.scale(1, 1);
    }

    onUpdate(): void {
        // console.log(this.candyParent._children[5]['Candy'].moveAStep);
        // 时间到了才可以进行操作
        if (this.mainSceneControl.timerControl > 200 && !this.operationSwitch) {
            this.operationSwitch = true;
            this.buttonClink();
            console.log('游戏开始！敌人来袭!');
        }
    }
    onDisable(): void {
    }
}