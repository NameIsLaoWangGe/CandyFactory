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
    /**主角*/
    private role_01;

    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
        this.bucketClink();
    }

    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);
        this.candyParent = this.mainSceneControl.candyParent;
    }

    /**操作按钮的点击事件*/
    bucketClink(): void {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.down);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.move);
        this.self.on(Laya.Event.MOUSE_UP, this, this.up);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.out);
    }

    /**判断我按下的按钮和准备位置的糖果是否匹配;
     * 如果匹配，那么看下糖果上面写的几次点击次数，需要连续点击到这个次数才可以吃糖果
     * 如果次数没有达到，却点了另一种按钮，那么前面的次数会重置，并且出现一个怪物
     * 如果不匹配，说明点错了，糖果会跳到外面变成一个怪物,则出现一个怪物
     */
    down(event): void {
        if (this.candyParent._children.length > 0) {
            let candy = this.candyParent._children[0] as Laya.Sprite;
            let clicksLabel = candy.getChildByName('clicksLabel') as Laya.Label;

            let candyName = candy.name.substring(0, 11);
            let group = candyName + this.self.name;
            let matching_01 = 'redCandy___' + 'redButton';
            let matching_02 = 'yellowCandy' + 'yellowButton';

            if (group === matching_01 || group === matching_02) {
                clicksLabel.text = (Number(clicksLabel.text) - 1).toString();
                // 消除重置点击次数
                if (Number(clicksLabel.text) === 0) {
                    candy.removeSelf();
                    this.createNewCandy();


                    for (let i = 0; i < this.candyParent._children.length; i++) {
                        this.candyParent._children[i]['Candy'].moveRules();
                    }
                }
            } else {
                console.log('产生一个敌人');
            }
        }
        this.self.scale(0.9, 0.9);
        // 如果感应区有糖果,找到第一个进入感应区的糖果的唯一名称
    }

    /**在最后面重新生成一个糖果加入队列*/
    createNewCandy(): void {
        let candy = this.mainSceneControl.createCandy() as Laya.Sprite;
        // 这里this.candyParent._children.length - 2，因为已经删除一个了
        let y = this.candyParent._children[this.candyParent._children.length - 2].y;
        candy.y = y - (candy['Candy'].spaceY + candy.height);
        candy['Candy'].newCandy = true;
        candy['Candy'].timeControl = 20;
    }

    /**主角增加属性规则*/
    roleAddProperty(candy: Laya.Sprite): void {
        let name = candy.name;
        this.role_01 = this.selfScene['MainSceneControl'].role_01;
        switch (name) {
            case 'yellowCandy':
                this.role_01['Role'].role_property.attackValue += 100;
                break;
            case 'redCandy___':
                this.role_01['Role'].role_property.blood += 100;
                break;
            default:
                break;
        }
    }

    /**移动*/
    move(event): void {
    }
    /**抬起*/
    up(): void {
        this.self.scale(1, 1);
    }
    /**出屏幕*/
    out(): void {
        this.self.scale(1, 1);
    }
    onDisable(): void {
    }
}