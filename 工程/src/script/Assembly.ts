export default class Assembly extends Laya.Script {
    /** @prop {name:machine, tips:糖果制造机器, type:Node}*/
    public machine: Laya.Sprite;
    /** @prop {name:LongPointer, tips:长指针, type:Node}*/
    public LongPointer: Laya.Sprite;

    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**烟囱烟雾特效开关*/
    private smokeSwitch: boolean;
    /**烟囱烟雾特效产生的时间间隔*/
    private smokeInterval: number;
    /**烟囱烟雾特效当前产生时间记录*/
    private smokeTime: number;

    /**抖动频率，机器会按一定的时间抖动，这个时间间隔可能是随机的*/
    private shakeInterval: number;
    /**抖动事件记录*/
    private shakeTime: number;
    /**抖动开关*/
    private shakeSwitch: boolean;
    /**时间线*/
    private timeLine: number;
    /**方向记录*/
    private moveDirection: string;
    /**初始位置*/
    private initialPX: number;
    /**抖动次数*/
    private launchNum: number;
    /**当前这次抖动的时间*/
    private launchSwitch: boolean;

    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene;
        this.smokeSwitch = true;
        this.smokeTime = Date.now();
        this.smokeInterval = 500;
        this.initialPX = this.machine.x;
        // 随机方向
        this.moveDirection = Math.random() * 2 === 1 ? 'left' : 'right';
        this.shakeInterval = 30;
        this.shakeTime = Date.now();
        this.timeLine = 0;
        // 抖动函数
        this.launchNum = 0;
        this.launchSwitch = true;
        this.shakeLaunchCandy();
    }

    //普通抖动
    commonShake() {
        if (this.shakeSwitch) {
            let nowTime = Date.now();
            if (nowTime - this.shakeTime > this.shakeInterval) {
                this.shakeTime = nowTime;
                if (this.moveDirection === "left") {
                    this.machine.x -= 1;
                    if (this.machine.x < this.initialPX) {
                        this.moveDirection = "right";
                    }
                } else if (this.moveDirection === "right") {
                    this.machine.x += 1;
                    if (this.machine.x > this.initialPX) {
                        this.moveDirection = "left";
                    }
                }
            }
        }
    }

    //机器抖动预备发射糖果的行为
    shakeLaunchCandy(): void {
        this.shakeMethod(this.machine);
    }

    /**抖动函数*/
    shakeMethod(target): void {
        if (this.launchSwitch === false) {
            return;
        }
        let direction = this.launchNum % 2 === 0 ? 1 : -1;
        // 第三步降落
        Laya.Tween.to(target, { x: this.initialPX - direction }, 30, null, Laya.Handler.create(this, function () {
            this.launchNum++;
            if (this.launchNum >= 50) {
                this.launchSwitch = false;
                this.launchNum = 0;
            } else {
                this.shakeMethod(target);
            }
        }), 0);
    }

    /**进度条的抖动行为，当进度条的时间大于于0.7的时候，轻微抖动，当大于0.9的时候抖动加强*/

    onUpdate(): void {
        this.timeLine++;
        // 烟囱烟雾特效
        if (this.smokeSwitch) {
            let nowTime = Date.now();
            if (nowTime - this.smokeTime > this.smokeInterval) {
                // 重置时间
                this.smokeTime = nowTime;
                // 随机时间间隔
                let random = Math.floor(Math.random() * 300) + 100;
                this.smokeInterval = 600 - random;
                // 随机位置
                this.selfScene['MainSceneControl'].explodeAni(this.machine, 650, 190, 'smokeEffects', 1, 10);
            }
        }

        // 指针动作
        this.LongPointer.rotation += 10;
    }

    onDisable(): void {
    }
}