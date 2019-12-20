import MainSceneControl from "./MainSceneControl";
import Candy from "./Candy";
export default class Role extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**糖果到碰到感应装置时，名字装进这个数组*/
    private nameAndIndex: Array<string>;
    /**糖果父节点*/
    private candyParent: Laya.Sprite;
    /**血量*/
    private health: Laya.ProgressBar;

    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
    }
    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Scene;
        let mainSceneControl = this.selfScene.getComponent(MainSceneControl);
        this.nameAndIndex = mainSceneControl.nameAndIndex;
        this.candyParent = mainSceneControl.candyParent;
        this.health = this.self.getChildByName('health') as Laya.ProgressBar;
        this.health.value = 1;
        this.bucketClink();
    }
    /**桶点击事件*/
    bucketClink(): void {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.down);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.move);
        this.self.on(Laya.Event.MOUSE_UP, this, this.up);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.out);
    }
    /**按下,给予目标位置，糖果走向目标位置;
     * 并且分数增加*/
    down(event): void {
        this.self.scale(0.9, 0.9);
        // 如果感应区有糖果,找到第一个进入感应区的糖果的唯一名称
        if (this.nameAndIndex[0]) {
            let candyName = this.nameAndIndex[this.nameAndIndex.length - 1];
            let candy = this.candyParent.getChildByName(candyName);
            let CandyScript = candy.getComponent(Candy);
            // 给予目标地点,非空说明点击过了
            if (CandyScript.targetRole === null) {
                CandyScript.targetRole = this.self;
            }
        } else {
            console.log('糖果不在感应区，或者点错了');
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