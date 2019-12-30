import MainSceneControl from "./MainSceneControl";
import Role from "./Role";
export default class Enemy extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**自己的血量*/
    private selfHealth: Laya.ProgressBar;
    /**自己移动速度*/
    private selfSpeed: number;

    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本组件*/
    private mainSceneControl;

    /**主角1脚本组件*/
    private Role_01;
    /**主角2脚本组件*/
    private Role_02;

    /**主角的父节点*/
    private roleParent: Laya.Sprite;
    /**怪物攻击对象,也是上个吃糖果对象,一次性，赋一次值只能用一次*/
    private slefTagRole: Laya.Sprite;
    /**怪物出现位置*/
    private
    /**攻击对象血量*/
    private tagHealth: Laya.ProgressBar;
    /**对话框*/
    private speakBox: Laya.Prefab;

    /**攻击时间间隔*/
    private attackTnterval: number;
    /**当前时间，用于对比时间间隔*/
    private recordTime: number;
    /**分数*/
    private scoreLabel: Laya.Label;
    /**当前属性*/
    private enemyProperty: any;
    /**血量值显示的label*/
    private bloodLabel: any;
    /**属性展示框*/
    private propertyShow: Laya.Image;
    /**被击退效果计时*/
    private repelTimer: number;

    /**属性飘字提示*/
    private hintWord: Laya.Prefab;

    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
    }

    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.owner.scene as Laya.Scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);//场景脚本组件
        this.roleParent = this.mainSceneControl.roleParent;
        // this.slefTagRole = this.mainSceneControl.enemyTagRole;
        // this.tagHealth = this.slefTagRole.getChildByName('health') as Laya.ProgressBar;
        this.selfHealth = this.self.getChildByName('health') as Laya.ProgressBar;
        this.selfSpeed = 4;
        this.propertyShow = this.self.getChildByName('propertyShow') as Laya.Image;

        this.attackTnterval = 100;
        this.recordTime = Date.now();

        this.speakBox = this.mainSceneControl.speakBox;
        this.scoreLabel = this.mainSceneControl.scoreLabel;
        // this.Role_01 = this.mainSceneControl.role_01.getComponent(Role);
        // this.Role_02 = this.mainSceneControl.role_02.getComponent(Role);

        this.repelTimer = 0;
        this.hintWord = this.mainSceneControl.hintWord as Laya.Prefab;

        this.self['Enemy'] = this;
        this.bucketClink();
        this.enemyPropertySet();
    }


    /**怪物等级包括的一些属性*/
    enemyPropertySet(): void {
        // 属性赋值
        this.enemyProperty = {
            level: '',
            blood: '',
            moveSpeed: '',
            defense: '',
        }
        this.enemyProperty.blood = this.mainSceneControl.enemyProperty.blood;
        this.enemyProperty.attackValue = this.mainSceneControl.enemyProperty.attackValue;
        this.enemyProperty.attackSpeed = this.mainSceneControl.enemyProperty.attackSpeed;
        this.enemyProperty.defense = this.mainSceneControl.enemyProperty.defense;
        this.enemyProperty.moveSpeed = this.mainSceneControl.enemyProperty.moveSpeed;
    }

    /**属性刷新显示规则,血量显示一定是整数10*/
    enemyPropertyUpdate(): void {
        // 血条上的血量显示
        this.bloodLabel = this.selfHealth.getChildByName('bloodLabel') as Laya.Label;
        let str = Math.round(this.enemyProperty.blood * this.selfHealth.value).toString();
        let subStr_01 = str.substring(0, str.length - 1);
        let subStr_02 = subStr_01 + 0;
        this.bloodLabel.text = subStr_02;

        // 属性显示框上面显示的属性
        // 血量
        let blood = this.propertyShow.getChildByName('blood') as Laya.Label;
        blood.text = "血量: " + this.enemyProperty.blood;
        // 攻击力
        let attackValue = this.propertyShow.getChildByName('attackValue') as Laya.Label;
        attackValue.text = "攻击力: " + this.enemyProperty.attackValue;
        // 攻击速度
        let attackSpeed = this.propertyShow.getChildByName('attackSpeed') as Laya.Label;
        attackSpeed.text = "攻击速度: " + this.enemyProperty.attackSpeed;
        // 防御力
        let defense = this.propertyShow.getChildByName('defense') as Laya.Label;
        defense.text = "防御力: " + this.enemyProperty.defense;
    }

    /**敌人点击事件*/
    bucketClink(): void {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.down);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.move);
        this.self.on(Laya.Event.MOUSE_UP, this, this.up);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.out);
    }
    /**点击敌人，敌人头上会出现小锤子，敲打敌人，每点击一次血量会减少;
     * 如果不把敌人打死，那么主角就会被攻击
     * 当然吃到的糖果也会有另外的增益
     * 杀敌暂时不增加分数分数增加*/
    down(event): void {
        // 主角全部死亡时停止移动
        if (this.roleParent._children.length === 0) {
            return;
        } else {
            this.self.scale(0.95, 0.95);
            this.selfHealth.value -= 0.01;
        }
    }
    /**移动*/
    move(event): void {
    }
    /**抬起*/
    up(event): void {
        this.self.scale(1, 1);
    }
    /**出屏幕*/
    out(event): void {
        this.self.scale(1, 1);
    }

    /** 敌人第二阶段移动到主角位置，并且进入主角射程范围的移动规则
     * 加入被子弹击退效果
    */
    enemyMove(): void {
        // x,y分别相减是两点连线向量
        // 向量计算并且归一化，向量长度为1。
        let point = new Laya.Point(this.slefTagRole.x - this.self.x, this.slefTagRole.y - this.self.y);
        point.normalize();
        // 判断是否激活被击退效果
        if (this.slefTagRole.x > Laya.stage.width / 2) {//右边
            // 右边发生预警
            this.mainSceneControl.role_01['Role'].role_Warning = true;
        } else if (this.slefTagRole.x < Laya.stage.width / 2) {//左边
            // 左边发生预警
            this.mainSceneControl.role_02['Role'].role_Warning = true;
        }
        // 被击退反向移动
        if (this.repelTimer > 0) {
            this.repelTimer--;
            //反向移动
            this.self.x -= point.x * 2;
            this.self.y -= point.y * 2;
        } else {
            //向量相加移动
            this.self.x += point.x * this.selfSpeed;
            this.self.y += point.y * this.selfSpeed;
        }
    }

    /**怪物对主角造成伤害的公式
     * 攻击力-主角防御如果大于零则造成伤害，否则不造成伤害
     * 并且在主角头上出现掉血动画提示
    */
    enemyAttackRules(): void {
        // 掉血显示值，伤害小于零则显示0
        let numberValue: number;
        // 通过攻击力计算掉血状况
        let damage = this.enemyProperty.attackValue - this.slefTagRole['Role'].role_property.defense;
        if (damage > 0) {
            this.slefTagRole['Role'].role_property.blood -= damage;
            numberValue = damage;
        } else {
            numberValue = 0;
        }
        this.hintWordMove(damage);
    }

    hintWordMove(damage: number): void {
        // 创建提示动画对象
        let hintWord = Laya.Pool.getItemByCreateFun('candy', this.hintWord.create, this.hintWord) as Laya.Sprite;
        hintWord.pos(0, -150);
        this.slefTagRole.addChild(hintWord);
        let proPertyType: string = '敌人掉血';
        let numberValue: number;
        hintWord['HintWord'].initProperty(proPertyType, damage);
    }

    onUpdate(): void {
        // 主角全部死亡则停止移动
        if (this.roleParent._children.length === 0) {
            return;
        }
        // 如果没有目标则什么都不执行
        if (this.slefTagRole === null) {
            return;
        }
        // 血量低于0则死亡,并且关闭主角发射子弹预警
        if (this.enemyProperty.blood < 0) {
            this.mainSceneControl.role_01['Role'].role_Warning = false;
            this.mainSceneControl.role_02['Role'].role_Warning = false;
            this.self.removeSelf();
        }
        // 属性实时刷新
        this.enemyPropertyUpdate();

        // 血量低于0死亡,并且增加分数,并且关闭主角攻击预警
        if (this.selfHealth.value <= 0) {
            this.scoreLabel.text = (Number(this.scoreLabel.text) + 200).toString();
            this.self.removeSelf();
            this.Role_01.role_Warning = false;
            this.Role_02.role_Warning = false;
        }
        // 移动
        this.enemyMove();
        // 到达对象位置后开启攻击开关进行攻击，攻击速度依照时间间隔而定
        // 此时移动速度为零
        let differenceX = Math.abs(this.self.x - this.slefTagRole.x);
        let differenceY = Math.abs(this.self.y - this.slefTagRole.y);
        if (differenceX < 100 && differenceY < 100) {
            this.selfSpeed = 0;
            let nowTime = Date.now();
            if (nowTime - this.recordTime > this.enemyProperty.attackSpeed) {
                this.recordTime = nowTime;
                // 血量判断，目标死亡后，会更换目标
                if (this.slefTagRole['Role'].role_property.blood > 0) {
                    this.enemyAttackRules();
                } else {
                    // 更换目标
                    if (this.slefTagRole.name === 'role_01') {
                        this.slefTagRole = this.mainSceneControl.role_02;
                        this.tagHealth = this.mainSceneControl.role_02.getChildByName('health');
                    } else if (this.slefTagRole.name === 'role_02') {
                        this.slefTagRole = this.mainSceneControl.role_01;
                        this.tagHealth = this.mainSceneControl.role_01.getChildByName('health');
                    }
                }
            }
        } else {
            this.selfSpeed = 4;
        }
    }

    onDisable(): void {
        Laya.Pool.recover('enemy', this.self);
    }

}