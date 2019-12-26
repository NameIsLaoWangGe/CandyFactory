import MainSceneControl from "./MainSceneControl";
export default class Candy extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本组件*/
    private mainSceneControl;
    /**糖果运行的速度*/
    private speed: number;
    /**糖果移动对象*/
    private candyTagRole: Laya.Sprite;
    /**主角的父节点*/
    private roleParent: Laya.Sprite;
    /**得分显示*/
    private scoreLabel: Laya.Label;
    /**时间线*/
    private timeControl: number;
    /**标记一下这是第几个糖果*/
    private tab: number;
    /**每个糖果之间的间距*/
    private spaceY: number;
    /**再次移动开关*/
    private moveSwitch: boolean;
    /**初始化的10个糖果的位置记录*/
    private posYArr: Array<number>;
    /**是否是新增糖果*/
    private newCandy: boolean;

    constructor() { super(); }
    onEnable(): void {
        this.initProperty();
        this.locationInit();
    }

    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);//场景脚本组件

        this.roleParent = this.mainSceneControl.roleParent;
        this.scoreLabel = this.mainSceneControl.scoreLabel;
        this.speed = 6;

        this.self['Candy'] = this;
        this.tab = this.mainSceneControl.candyCount;
        this.timeControl = 0;

        this.moveSwitch = false;
        this.spaceY = 5;
    }

    /**初始位置初始化*/
    locationInit(): void {
        this.posYArr = [];
        this.self.y = - this.tab * (this.self.height + this.spaceY);
        for (let i = 0; i < 10; i++) {
            let y = -(this.self.height + this.spaceY) * i;
            this.posYArr.push(y);
        }
    }

    /**当第一个糖果被吃掉后的移动函数*/
    moveRules(): void {
        Laya.Tween.to(this.self, { y: this.self.y + this.self.height + this.spaceY }, 100, Laya.Ease.circIn, Laya.Handler.create(this, function () {
        }, []), 0);
    }

    /**跳到地上变成一个敌人*/
    becomeEnemy(): void {

    }

    onUpdate(): void {
        this.timeControl += 0.1;
        if (this.timeControl > 20) {
            return;
        }
        this.self.y += 3;
    }
    onDisable(): void {
        // 清理动画
        Laya.Tween.clearAll(this);
        if (this.self.name === 'yellowCandy') {
            Laya.Pool.recover('yellowCandy', this.self);
        } else if (this.self.name === 'redCandy___') {
            Laya.Pool.recover('redCandy___', this.self);
        }
    }
}