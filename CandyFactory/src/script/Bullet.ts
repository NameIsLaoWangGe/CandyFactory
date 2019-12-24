import MainSceneControl from "./MainSceneControl";

export default class Bullet extends Laya.Script {

    /**怪物父节点*/
    private enemyParent: Laya.Sprite;
    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本*/
    private mainSceneControl;
    /**初始x*/
    private initial_X: number;
    /**初始Y*/
    private initial_Y: number;
    /**子弹速度*/
    private selfSpeed: number;

    constructor() { super(); }

    onEnable(): void {
        this.init();
    }
    // 初始化
    init() {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);
        this.enemyParent = this.mainSceneControl.enemyParent;
        this.selfSpeed = 10;
    }

    onDisable(): void {
    }

    onUpdate(): void {
        // 直线射击
        this.self.y -= this.selfSpeed;

        // 射程为500，超过射程消失
        if (this.self.y <= Laya.stage.width * 1 / 3) {
            this.self.removeSelf();
            return;
        }

        // 超出横向范围消失，一般不会触发
        if (this.self.x > 750 + this.self.width + 50 || this.self.x < -this.self.width) {
            this.self.removeSelf();
        }

        // 碰到任何一个怪物，子弹消失怪物掉血
        for (let i = 0; i < this.enemyParent._children.length; i++) {
            let enemy = this.enemyParent._children[i] as Laya.Sprite;
            let differenceX = Math.abs(enemy.x - this.self.x);
            let differenceY = Math.abs(enemy.y - this.self.y);
            if (differenceX < 50 && differenceY < 50) {
                let enemyHealth = enemy.getChildByName('health') as Laya.ProgressBar;
                enemyHealth.value -= 0.1;
                this.self.removeSelf();
            }
        }
    }
}