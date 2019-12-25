import MainSceneControl from "./MainSceneControl";

export default class Bullet extends Laya.Script {
    /**怪物父节点*/
    private enemyParent: Laya.Sprite;
    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**主角*/ 
    /**场景脚本*/
    private mainSceneControl;
    /**初始x*/
    private initial_X: number;
    /**初始Y*/
    private initial_Y: number;
    /**子弹速度*/
    private selfSpeed: number;
    /**左右子弹位置*/
    private location: string;
    /**目标，这个目标是最近的那个敌人*/
    private bulletTarget: Laya.Sprite;

    constructor() { super(); }

    onEnable(): void {
        this.init();
    }

    /**初始化一些属性*/
    init() {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);
        this.enemyParent = this.mainSceneControl.enemyParent;
        this.selfSpeed = 15;
        // 索敌
        this.lockedBulletTarget();
    }

    /**锁定最近的那个敌人
     * 如果没有敌人，且屏幕上敌人存在，那么会锁定一个敌人
    */
    lockedBulletTarget(): void {
        // 两点之间的距离数组
        let distanceArr: Array<any> = [];
        for (let i = 0; i < this.enemyParent._children.length; i++) {
            let enemy = this.enemyParent._children[i] as Laya.Sprite;
            //两点之间的距离
            let dx: number = enemy.x - this.self.x;
            let dy: number = enemy.y - this.self.y;
            let distance: number = Math.sqrt(dx * dx + dy * dy);
            let object = {
                distance: distance,
                name: enemy.name
            }
            distanceArr.push(object);
        }
        // 距离排序
        var compare = function (obj1, obj2) {
            var val1 = obj1.distance;
            var val2 = obj2.distance;
            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }
        distanceArr.sort(compare);
        if (distanceArr.length > 0) {
            this.bulletTarget = this.enemyParent.getChildByName(distanceArr[0].name) as Laya.Sprite;
        }
    }

    /**子弹移动
     * 子弹只有当目标对象和目标对象在父节点内的时候才会移动
     * 目标对象永远存在，只不过他被移除了，所以bulletTarget永不为空，只能判断父节点是否存在
     * 那么就会重新选择目标
    */
    bulletMove(): void {
        // this.lockedBulletTarget();
        if (this.bulletTarget && this.bulletTarget.parent) {
            // x,y分别相减是两点连线向量
            let point = new Laya.Point(this.bulletTarget.x - this.self.x, this.bulletTarget.y - this.self.y);
            // 归一化，向量长度为1。
            point.normalize();
            //向量相加
            this.self.x += point.x * this.selfSpeed;
            this.self.y += point.y * this.selfSpeed;
            // 射程为500，超过射程消失
            if (this.self.y <= Laya.stage.width * 1 / 3) {
                this.self.removeSelf();
                return;
            }
        } else {
            this.self.removeSelf();
        }
        // // 消失
        // if (this.enemyParent._children.length === 0) {
        //     this.self.removeSelf();
        // }
    }

    onUpdate(): void {
        // 移动
        this.bulletMove();
        // 超出横向范围消失，一般不会触发
        if (this.self.x > 750 + this.self.width + 50 || this.self.x < -this.self.width) {
            this.self.removeSelf();
        }

        // 碰到任何一个怪物，子弹消失怪物掉血
        // 如果没有到自己的位置，那么算出最近的那个敌人攻击
        for (let i = 0; i < this.enemyParent._children.length; i++) {
            let enemy = this.enemyParent._children[i] as Laya.Sprite;
            let differenceX = Math.abs(enemy.x - this.self.x);
            let differenceY = Math.abs(enemy.y - this.self.y);
            if (differenceX < 30 && differenceY < 30) {
                let enemyHealth = enemy.getChildByName('health') as Laya.ProgressBar;
                enemyHealth.value -= 0.01;
                this.self.removeSelf();
            }
        }
    }

    onDisable(): void {
        Laya.Pool.recover('bullet', this.self);
    }
}