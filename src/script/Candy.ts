export default class Candy extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**记录初次点击糖果的位置*/
    private touchX: number;
    private touchY: number;
    /**可滑动开关，这个开关控制只有点击之后才能滑动*/
    private touchMoveSWitch: boolean;

    constructor() { super(); }

    onEnable(): void {
        this.initScene();
        // this.candyClink();
    }

    /**初始化场景*/
    initScene(): void {
        this.self = this.owner as Laya.Sprite;
        this.touchX = null;
        this.touchY = null;
    }

    /**糖果点击事件，规则是滑动糖果，然后判断方向，并且直接飞向对应方向的的糖果盒子；
     * 如果糖果颜色和盒子颜色不匹配则游戏失败*/
    candyClink(): void {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.down);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.move);
        this.self.on(Laya.Event.MOUSE_UP, this, this.up);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.out);
    }
    /**按下*/
    down(event): void {
        this.touchX = event.stageX;
    }
    /**滑动,当滑动一定距离的时候则移动这个糖果
     * 移动之前关闭点击事件*/
    move(event): void {
        if (this.touchX !== null) {
            // 滑动位置
            let stageX = event.stageX;
            let stageY = event.stageY;
            // 滑动距离临界值
            let numberX = 0;
            // console.log(this.touchX);
            // console.log(stageX);
            // console.log(stageX - this.touchX);
            let differenceX = stageX - this.touchX;
            // let differenceY = stageY - this.touchX;
            if (Math.abs(differenceX) > numberX) {
                this.self.off(Laya.Event.MOUSE_DOWN, this, this.down);
                this.self.off(Laya.Event.MOUSE_MOVE, this, this.move);
                this.self.off(Laya.Event.MOUSE_UP, this, this.up);
                this.self.off(Laya.Event.MOUSE_OUT, this, this.out);
                if (differenceX > numberX) {
                    Laya.Tween.to(this.self, { x: 1000, Y: 0 }, 300, null, Laya.Handler.create(this, function () {
                    }, []), 0);
                } else if (differenceX < numberX) {
                    Laya.Tween.to(this.self, { x: -1000, Y: 0 }, 300, null, Laya.Handler.create(this, function () {
                    }, []), 0);
                }
                this.touchX = null;
            }
        }
    }
    /**抬起*/
    up(): void {
        this.touchX = null;
        this.touchY = null;
    }
    /**出屏幕*/
    out(): void {
        this.touchX = null;
        this.touchY = null;
    }

    /***检测碰撞*/
    onTriggerEnter(other: any, self: any, contact: any): void {
        let otherName = other.owner.name;
        let selfName = self.owner.name;
        let nameMerged_01 = 'redBucket' + 'redCandy';
        let nameMerged_02 = 'yellowBucket' + 'yellowCandy';
        if (otherName + selfName === nameMerged_01 || otherName + selfName === nameMerged_02) {
            this.self.removeSelf();
            Laya.Tween.clearAll(this.self);
        }
    }

    onUpdate(): void {
        // this.self.y += 2;
        // 超出范围消失
        if (this.self.y > Laya.stage.height + 100 || this.self.x > 750 + this.self.width + 50 || this.self.x < -this.self.width) {
            this.self.removeSelf();
        }
    }
    onDisable(): void {
        Laya.Pool.recover("candy", this.self);
    }
}